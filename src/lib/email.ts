/**
 * Transactional email — server-side only.
 *
 * Templates live in src/lib/emails/*.ts as pure functions that return
 * { subject, html, text }. When RESEND_API_KEY is unset (local dev) the
 * email is printed to the server console instead of sent, so links in
 * account-setup and payment emails can still be followed.
 */
import { Resend } from "resend";
import { site } from "@/lib/site";

let _resend: Resend | null = null;

export type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail(args: SendArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(
      `\n[email:dev] to=${[args.to].flat().join(", ")}\n[email:dev] subject=${args.subject}\n${args.text ?? "(html only)"}\n`,
    );
    return;
  }
  if (!_resend) _resend = new Resend(key);
  const { data, error } = await _resend.emails.send({
    from: process.env.EMAIL_FROM ?? `${site.name} <${site.contactEmail}>`,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    replyTo: args.replyTo,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  if (!data?.id) throw new Error("Resend returned no id — send may have failed silently.");
}

/** Fire-and-forget: logs failures instead of failing the request. */
export function sendEmailAsync(args: SendArgs): void {
  void sendEmail(args).catch((e) => {
    console.error("[email] send failed:", e instanceof Error ? e.message : e);
  });
}

/** Sends to ADMIN_NOTIFY_EMAIL if set; silently skips otherwise. */
export function notifyAdmin(args: Omit<SendArgs, "to">): void {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (to) sendEmailAsync({ ...args, to });
}
