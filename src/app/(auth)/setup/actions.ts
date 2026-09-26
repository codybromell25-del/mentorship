"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { accountsEnabled } from "@/lib/config";
import type { FormState } from "../actions";

const schema = z.object({
  code: z.string().min(1, "Enter the setup code."),
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.email("Enter a valid email.").trim().toLowerCase(),
  password: z.string().min(10, "Use at least 10 characters.").max(200),
});

const digest = (s: string) => createHash("sha256").update(s).digest();

/**
 * Creates the first admin account on a fresh deployment. Needs the
 * SETUP_CODE environment variable, and only works while no admin exists,
 * so it switches itself off after first use.
 */
export async function createFirstAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  const setupCode = process.env.SETUP_CODE;
  if (!accountsEnabled() || !setupCode) return { error: "Setup is switched off on this deployment." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  // Constant-time comparison of equal-length digests.
  if (!timingSafeEqual(digest(d.code), digest(setupCode))) return { error: "That setup code isn't right." };

  if ((await prisma.user.count({ where: { role: "ADMIN" } })) > 0) {
    return { error: "An admin account already exists. Sign in instead." };
  }

  const passwordHash = await bcryptjs.hash(d.password, 12);
  await prisma.user.upsert({
    where: { email: d.email },
    update: { name: d.name, role: "ADMIN", passwordHash },
    create: { name: d.name, email: d.email, role: "ADMIN", passwordHash },
  });

  redirect("/login?setup=done");
}
