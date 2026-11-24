import { z } from "zod";
import { CONTACT_CHANNELS } from "./types";
import { COUNTRIES } from "./countries";
import { contactErrorMessage, validateContact } from "./validation";

export const MAX_MESSAGE = 2000;

const CHANNEL_NAMES = CONTACT_CHANNELS.map((c) => c.name) as [
  (typeof CONTACT_CHANNELS)[number]["name"],
  ...(typeof CONTACT_CHANNELS)[number]["name"][],
];

/** Shared by the form (field errors) and the server action (authority). */
export const inquirySchema = z
  .object({
    productId: z.uuid({ error: "This work could not be found." }),
    name: z
      .string()
      .trim()
      .min(2, "Enter your name (2 to 80 characters).")
      .max(80, "Enter your name (2 to 80 characters)."),
    channel: z.enum(CHANNEL_NAMES, { error: "Choose a contact method." }),
    contact: z.string().trim().min(1, "Enter your contact details.").max(254),
    country: z
      .string()
      .refine((name) => COUNTRIES.some((c) => c.name === name), "Select your country."),
    message: z
      .string()
      .trim()
      .max(MAX_MESSAGE, `Keep your message under ${MAX_MESSAGE} characters.`)
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (!validateContact(v.channel, v.contact)) {
      ctx.addIssue({
        code: "custom",
        path: ["contact"],
        message: contactErrorMessage(v.channel),
      });
    }
  });

export type InquiryInput = z.input<typeof inquirySchema>;
export type InquiryData = z.output<typeof inquirySchema>;

export function fieldErrors(error: z.ZodError): Partial<Record<string, string>> {
  const out: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
