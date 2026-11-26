"use server"
import { createAdminClient } from "../supabase/admin";
import { isFormTokenValid } from "../security/formToken";
import { verifyTurnstile } from "../security/turnstile";
import { getClientIp, hashIp } from "../security/ip";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "../auth/requireAdmin";
import { INQUIRY_STATUSES } from "../inquiries/status";
import { sendTelegramNotification, escapeHtml } from "../notifications/telegram";
import { CONTACT_CHANNELS } from "../inquiries/types";
import { inquirySchema, fieldErrors } from "../inquiries/schema";
import { SITE_URL } from "../brand";
import { getInquiryAttribution } from "../attribution/server";
import { formatSource } from "../attribution/attribution";

const statusSchema = z.enum(INQUIRY_STATUSES);

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

        // Read from the server-set cookie and headers only, never from the form.
        const attribution = await getInquiryAttribution();

        const { error } = await supabase.from("inquiries").insert({
            product_id: product.id,
            type: "purchase",
            buyer_name: name,
            buyer_contact: contact,
            buyer_country: country,
            message: message || null,
            status: "new",
            preferred_channel: channel,
            ip_hash: ipHash,
            source: attribution.source,
            utm: attribution.utm,
            referrer: attribution.referrer,
            landing_path: attribution.landingPath,
        });
        if (error) throw new Error(error.message);

        await notifyNewInquiry({
            title: product.title, name, contact, country, channel, message,
            source: formatSource(attribution.source, attribution.medium),
        });
        return { ok: true };
    } catch (err) {
        console.error("submitInquiry error:", err instanceof Error ? err.message : err);
        return { ok: false, error: GENERIC_ERROR };
    }
}

async function notifyNewInquiry(i: {
    title: string; name: string; contact: string; country: string; channel: string; message?: string;
    source: string;
}) {
    const { title, name, contact, country, channel, message, source } = i;
    const channelLabel = CONTACT_CHANNELS.find((c) => c.name === channel)?.label ?? channel;
    await sendTelegramNotification(
        `<b>New inquiry</b>\n"${escapeHtml(title)}"\n\n` +
        `Name: ${escapeHtml(name)}\n` +
        `Contact: ${escapeHtml(contact)}\n` +
        `Country: ${escapeHtml(country)}\n` +
        `Prefers: ${escapeHtml(channelLabel)}\n` +
        `Source: ${escapeHtml(source)}` +
        (message ? `\nMessage: ${escapeHtml(message)}` : "") +
        `\n\n<a href="${escapeHtml(SITE_URL + "/admin/inquiries")}">Open inquiries</a>`
    );
}

export async function updateInquiryStatus(id: string, status: string) {
    const { supabase } = await requireAdmin();
    const parsedId = z.uuid().safeParse(id);
    const parsedStatus = statusSchema.safeParse(status);
    if (!parsedId.success || !parsedStatus.success) throw new Error("Invalid status");

    // Updates the inquiry and writes its inquiry_events row in one transaction.
    const { error } = await supabase.rpc("set_inquiry_status", {
        p_inquiry_id: parsedId.data,
        p_status: parsedStatus.data,
    });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/inquiries");
}
