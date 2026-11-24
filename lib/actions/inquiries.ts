"use server"
import { createClient } from "../supabase/server"
import { revalidatePath } from "next/cache";
import { sendTelegramNotification, escapeHtml } from "../notifications/telegram";
import { InquiryIntent } from "../inquiries/types";
import { CHANNEL_CONTACT_TYPE, validateContact } from "../inquiries/validation";

const MAX_NAME = 100;
const MAX_MESSAGE = 2000;
const INQUIRY_STATUSES = ["new", "contacted", "completed"];

export async function submitInquiry(order: InquiryIntent, preferredChannel: string) {
    const buyerName = (order.buyerName ?? "").trim();
    const buyerContact = (order.buyerContact ?? "").trim();
    const buyerCountry = (order.buyerCountry ?? "").trim();
    const message = (order.message ?? "").trim();

    if (!buyerName || buyerName.length > MAX_NAME) throw new Error("Please enter a valid name");
    if (!buyerCountry || buyerCountry.length > MAX_NAME) throw new Error("Please select your country");
    if (message.length > MAX_MESSAGE) throw new Error("Message is too long");
    if (!(preferredChannel in CHANNEL_CONTACT_TYPE)) throw new Error("Invalid contact channel");
    if (!validateContact(preferredChannel, buyerContact)) {
        throw new Error("Invalid contact info");
    }

    const supabase = await createClient();

    // Never trust the title/availability sent by the browser.
    const { data: painting } = await supabase
        .from("products")
        .select("id, title, status")
        .eq("id", order.paintingId)
        .single();
    if (!painting) throw new Error("Painting not found");
    if (painting.status !== "available") throw new Error("This painting is no longer available");

    const { error } = await supabase.from("inquiries").insert({
        painting_id: painting.id,
        buyer_name: buyerName,
        buyer_contact: buyerContact,
        buyer_country: buyerCountry,
        message: message || null,
        status: "new",
        preferred_channel: preferredChannel
    });

    if (error) {
        console.error("submitInquiry error:", error.message);
        throw new Error("Could not submit inquiry");
    }

    await sendTelegramNotification(
        `<b>New inquiry</b>
"${escapeHtml(painting.title)}"

` +
        `Name: ${escapeHtml(buyerName)}
Contact: ${escapeHtml(buyerContact)}
Country: ${escapeHtml(buyerCountry)}
` +
        `Prefers: ${escapeHtml(preferredChannel)}${message ? `
Message: ${escapeHtml(message)}` : ""}`
    );
}

export async function updateInquiryStatus(id: string, status: string) {
    if (!INQUIRY_STATUSES.includes(status)) throw new Error("Invalid status");
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/inquiries");
}