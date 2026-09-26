import { createHash, randomBytes } from "node:crypto";
import type { TokenPurpose } from "@prisma/client";
import { prisma } from "@/lib/db";

const TTL_HOURS: Record<TokenPurpose, number> = {
  ACCOUNT_SETUP: 24 * 7,
  PASSWORD_RESET: 2,
};

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Creates a single-use token and returns the raw value for the email link. */
export async function issueAuthToken(userId: string, purpose: TokenPurpose): Promise<string> {
  const raw = randomToken();
  await prisma.authToken.create({
    data: {
      userId,
      purpose,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + TTL_HOURS[purpose] * 3600_000),
    },
  });
  return raw;
}

/** Returns the token row if it's valid and unused, else null. */
export async function findValidAuthToken(raw: string) {
  const row = await prisma.authToken.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;
  return row;
}
