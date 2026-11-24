export type ContactFieldType = "phone" | "username" | "phone_or_username" | "email";

export const CHANNEL_CONTACT_TYPE: Record<string, ContactFieldType>= {
    whatsapp: "phone",
    viber: "phone",
    instagram: "username",
    telegram: "phone_or_username",
    email: "email"
};

export type ContactMode = "phone" | "username";

const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_REGEX = /^@?[a-zA-Z0-9_.]{2,30}$/;

export function isValidPhone(value: string): boolean
{
    return PHONE_REGEX.test(value.replace(/[\s-]/g, ""));
}

export function isValidUsername(value: string): boolean {
    return USERNAME_REGEX.test(value.trim());
}

export function isValidEmail(value: string): boolean {
    const v = value.trim();
    return v.length <= 254 && EMAIL_REGEX.test(v);
}

export function validateContact(channel:string, value: string): boolean{
    const trimmed = value.trim();
    if(!trimmed) return false;
    const type = CHANNEL_CONTACT_TYPE[channel];
    if(type === "phone") return isValidPhone(trimmed);
    if(type === "username") return isValidUsername(trimmed);
    if(type === "email") return isValidEmail(trimmed);
    return isValidPhone(trimmed) || isValidUsername(trimmed);
}

export function contactPlaceholder(channel: string): string{
    const type = CHANNEL_CONTACT_TYPE[channel];
    if(type === "phone") return "XX XXX XX XX";
    if(type === "username") return "@username";
    if(type === "email") return "name@example.com";
    return "Number or @username";
}

export function contactErrorMessage(channel: string): string {
    const type = CHANNEL_CONTACT_TYPE[channel];
    if(type === "phone") return "Enter a valid phone number";
    if (type === "username") return "Enter a valid Instagram username.";
    if (type === "email") return "Enter a valid email address.";
    return "Enter a valid phone number or Telegram username.";
}

export function resolveContactMode(channel:string, value: string) : ContactMode
{
    const type = CHANNEL_CONTACT_TYPE[channel];
    if(type === "phone") return "phone";
    if(type === "username" || type === "email") return "username";
    return /^@|[a-zA-Z]/.test(value.trim()) ? "username" : "phone";
}
