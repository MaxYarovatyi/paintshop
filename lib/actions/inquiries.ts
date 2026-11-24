"use server"
import { createClient } from "../supabase/server"
import { revalidatePath } from "next/cache";
import { sendTelegramNotification, escapeHtml } from "../notifications/telegram";
import { CONTACT_CHANNELS } from "../inquiries/types";
import { inquirySchema, fieldErrors } from "../inquiries/schema";
import { SITE_URL } from "../brand";

const INQUIRY_STATUSES = ["new", "contacted", "completed"];

export type SubmitResult =
    | { ok: true }
    | { ok: false; error: string; fields?: Partial<Record<string, string>> };

export async function submitInquiry(input: unknown): Promise<SubmitResult> {
    const parsed = inquirySchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, error: "Please check your details and try again.", fields: fieldErrors(parsed.error) };
    }
    const { productId, name, channel, contact, country, message } = parsed.data;

    const supabase = await createClient();

    // Never trust title, slug or availability sent by the browser.
    // The series join is explicit because a logged-in admin's session can see hidden works.
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
        preferred_channel: channel
    });

    if (error) {
        console.error("submitInquiry error:", error.message);
        return { ok: false, error: "Your inquiry could not be sent. Please try again later." };
    }

    const channelLabel = CONTACT_CHANNELS.find((c) => c.name === channel)?.label ?? channel;
    await sendTelegramNotification(
        `<b>New inquiry</b>\n"${escapeHtml(product.title)}"\n\n` +
        `Name: ${escapeHtml(name)}\n` +
        `Contact: ${escapeHtml(contact)}\n` +
        `Country: ${escapeHtml(country)}\n` +
        `Prefers: ${escapeHtml(channelLabel)}` +
        (message ? `\nMessage: ${escapeHtml(message)}` : "") +
        `\n\n<a href="${escapeHtml(SITE_URL + "/admin/inquiries")}">Open inquiries</a>`
    );
    return { ok: true };
}

export async function updateInquiryStatus(id: string, status: string) {
    if (!INQUIRY_STATUSES.includes(status)) throw new Error("Invalid status");
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/inquiries");
}
