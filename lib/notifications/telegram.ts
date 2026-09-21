export async function sendTelegramNotification(text:string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if(!token || !chatId){
        console.log("Telegram notification not configured");
        return;
    }
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({chat_id: chatId, text, parse_mode: "HTML"}),
        });
    } catch (err) {
        console.error("Telegram notification failed:", err);
    }
}