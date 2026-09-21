export type ContactFieldType = "phone" | "username" | "phone_or_username";

export const CHANNEL_CONTACT_TYPE: Record<string, ContactFieldType>= {
    whatsapp: "phone",
    viber: "phone",
    instagram: "username",
    telegram: "phone_or_username"
};

const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const USERNAME_REGEX = /^@?[a-zA-Z0-9_.]{2,30}$/;

export function isValidPhone(value: string): boolean
{
    return PHONE_REGEX.test(value.replace(/[\s-]/g, ""));
}

export function isValidUsername(value: string): boolean {
    return USERNAME_REGEX.test(value.trim());
}

export function validateContact(channel:string, value: string): boolean{
    const trimmed = value.trim();
    if(!trimmed) return false;
    const type = CHANNEL_CONTACT_TYPE[channel];
    if(type === "phone") return isValidPhone(trimmed);
    if(type === "username") return isValidUsername(trimmed);
    return isValidPhone(trimmed) || isValidUsername(trimmed);
}

export function contactPlaceholder(channel: string): string{
    const type = CHANNEL_CONTACT_TYPE[channel];
    if(type === "phone") return "+380 XX XXX XX XX";
    if(type === "username") return "@username";
    return "+380 XX XXX XX XX or @username";
}

export function contactErrorMessage(channel: string): string {
    const type = CHANNEL_CONTACT_TYPE[channel];
    if(type === "phone") return "Enter a valid phone number";
    if (type === "username") return "Enter a valid Instagram username.";
    return "Enter a valid phone number or Telegram username.";
}
