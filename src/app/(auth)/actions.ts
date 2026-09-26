"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appUrl } from "@/lib/site";
import { findValidAuthToken, issueAuthToken } from "@/lib/tokens";
import { sendEmailAsync } from "@/lib/email";
import { passwordResetEmail } from "@/lib/emails";

export type FormState = { error?: string; ok?: string } | null;

/** Only allow same-site relative paths as post-login destinations. */
function safeNext(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/home";
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: safeNext(String(formData.get("next") ?? "")),
    });
  } catch (e) {
    if (e instanceof AuthError) return { error: "That email and password don't match." };
    throw e; // includes the redirect "error" Next uses on success
  }
  return null;
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const ok = { ok: "If that email has an account, a reset link is on its way." };
  if (!email) return { error: "Enter your email." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // Users who never finished setup get a fresh setup link instead.
    const purpose = user.passwordHash ? "PASSWORD_RESET" : "ACCOUNT_SETUP";
    const token = await issueAuthToken(user.id, purpose);
    sendEmailAsync({ to: user.email, ...passwordResetEmail({ name: user.name, url: `${appUrl()}/set-password/${token}` }) });
  }
  // Same response either way so the form can't be used to probe for accounts.
  return ok;
}

const passwordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters.").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match." });

export async function setPassword(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = passwordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const row = await findValidAuthToken(token);
  if (!row) return { error: "This link has expired or was already used. Request a new one from the sign-in page." };

  const passwordHash = await bcryptjs.hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    // Burn every outstanding token for this user, not just this one.
    prisma.authToken.updateMany({ where: { userId: row.userId, usedAt: null }, data: { usedAt: new Date() } }),
  ]);

  redirect("/login?password=set");
}
