"use server";
import { issueFormToken } from "../security/formToken";

/** Called by the form on mount; the timestamp proves how long the form was open. */
export async function getFormToken(): Promise<string> {
  return issueFormToken();
}
