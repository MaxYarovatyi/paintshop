"use server"
import { createClient } from "../supabase/server"
import { createAdminClient } from "../supabase/admin";
import { isFormTokenValid } from "../security/formToken";
import { verifyTurnstile } from "../security/turnstile";
import { getClientIp, hashIp } from "../security/ip";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification, escapeHtml } from "../notifications/telegram";
import { CONTACT_CHANNELS } from "../inquiries/types";
import { inquirySchema, fieldErrors } from "../inquiries/schema";
import { SITE_URL } from "../brand";

const INQUIRY_STATUSES = ["new", "contacted", "completed"];

export type SubmitResult =
    | { ok: true }
    | { ok: false; error: string; fields?: Partial<Record<string, string>> };

const GENERIC_ERROR = "Your inquiry could not be sent. Please try again later.";
const MAX_PER_HOUR = 3;

export async function submitInquiry(input: unknown): Promise<SubmitResult> {
    const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

    try {
        // 1. Honeypot: bots fill it. Pretend success and drop.
        if (typeof raw.website === "string" && raw.website.trim() !== "") return { ok: true };

        // 2. Minimum fill time, proven by a signed timestamp. Dropped silently.
        if (!isFormTokenValid(raw.formToken)) return { ok: true };

        // 3. Cloudflare Turnstile.
        const ip = await getClientIp();
        if (!(await verifyTurnstile(raw.turnstileToken, ip))) {
            return { ok: false, error: GENERIC_ERROR };
        }

        // 4. Shape and content.
        const parsed = inquirySchema.safeParse(raw);
        if (!parsed.success) {
            return { ok: false, error: "Please check your details and try again.", fields: fieldErrors(parsed.error) };
        }
        const { productId, name, channel, contact, country, message } = parsed.data;

        const supabase = createAdminClient();

        // 5. Rate limit: at most 3 inquiries per hashed IP per hour.
        const ipHash = hashIp(ip);
        if (ipHash) {
            const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const { count, error: countError } = await supabase
                .from("inquiries")
                .select("id", { count: "exact", head: true })
                .eq("ip_hash", ipHash)
                .gte("created_at", since);
            if (countError) throw new Error(countError.message);
            if ((count ?? 0) >= MAX_PER_HOUR) return { ok: false, error: GENERIC_ERROR };
        }

        // Never trust title, slug or availability sent by the browser. This client
        // bypasses RLS, so visibility is checked here: sold, reserved and works in a
        // "coming" series are refused.
        const { data: product } = await supabase
            .from("products")
            .select("id, title, status, series:series_id(status)")
            .eq("id", productId)
            .maybeSingle();
        const series = product?.series as { status: string } | { status: string }[] | null | undefined;
        const seriesStatus = Array.isArray(series) ? series[0]?.status : series?.status;
        if (!product || product.status !== "available" || seriesStatus === "coming") {
            return { ok: false, error: "This work is not available for inquiries." };
        }

        const { error } = await supabase.from("inquiries").insert({
            painting_id: product.id,
            buyer_name: name,
            buyer_contact: contact,
            buyer_country: country,
            message: message || null,
            status: "new",
            preferred_channel: channel,
            ip_hash: ipHash,
        });
        if (error) throw new Error(error.message);

        await notifyNewInquiry({ title: product.title, name, contact, country, channel, message });
        return { ok: true };
    } catch (err) {
        console.error("submitInquiry error:", err instanceof Error ? err.message : err);
        return { ok: false, error: GENERIC_ERROR };
    }
}

async function notifyNewInquiry(i: {
    title: string; name: string; contact: string; country: string; channel: string; message?: string;
}) {
    const { title, name, contact, country, channel, message } = i;
    const channelLabel = CONTACT_CHANNELS.find((c) => c.name === channel)?.label ?? channel;
    await sendTelegramNotification(
        `<b>New inquiry</b>\n"${escapeHtml(title)}"\n\n` +
        `Name: ${escapeHtml(name)}\n` +
        `Contact: ${escapeHtml(contact)}\n` +
        `Country: ${escapeHtml(country)}\n` +
        `Prefers: ${escapeHtml(channelLabel)}` +
        (message ? `\nMessage: ${escapeHtml(message)}` : "") +
        `\n\n<a href="${escapeHtml(SITE_URL + "/admin/inquiries")}">Open inquiries</a>`
    );
}

export async function updateInquiryStatus(id: string, status: string) {
    if (!INQUIRY_STATUSES.includes(status)) throw new Error("Invalid status");
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/inquiries");
}
