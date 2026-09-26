/**
 * Google Calendar + Meet for mentors, via plain REST calls.
 *
 * A mentor connects once (OAuth, scope calendar.events). Sessions they
 * book are then created on their primary calendar with a Meet link and
 * the mentee as an attendee, so Google sends the invite and keeps both
 * calendars in sync on reschedule/cancel.
 *
 * Server-side only. Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET;
 * without them the app falls back to each mentor's saved meeting link.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { appUrl, site } from "@/lib/site";

const SCOPES = ["openid", "email", "https://www.googleapis.com/auth/calendar.events"];
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export function googleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function redirectUri(): string {
  return `${appUrl()}/api/google/callback`;
}

// ─── Token encryption (AES-256-GCM, key derived from AUTH_SECRET) ────

function key(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required to store Google tokens.");
  return createHash("sha256").update(`google-token:${secret}`).digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

function decrypt(packed: string): string {
  const [iv, tag, data] = packed.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

// ─── OAuth ───────────────────────────────────────────────────────────

export function authUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent", // always return a refresh token
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

type TokenResponse = { access_token: string; refresh_token?: string; error?: string; error_description?: string };

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      ...body,
    }),
  });
  const json = (await res.json()) as TokenResponse;
  if (!res.ok) throw new GoogleError(json.error ?? "token_error", json.error_description ?? "Google token request failed");
  return json;
}

/** Exchanges the OAuth code and stores the (encrypted) refresh token. */
export async function connectGoogle(userId: string, code: string): Promise<string> {
  const tokens = await tokenRequest({ code, grant_type: "authorization_code", redirect_uri: redirectUri() });
  if (!tokens.refresh_token) throw new GoogleError("no_refresh_token", "Google didn't return a refresh token. Try connecting again.");

  const info = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).then((r) => r.json() as Promise<{ email?: string }>);
  const googleEmail = info.email ?? "Google account";

  await prisma.googleAccount.upsert({
    where: { userId },
    update: { googleEmail, refreshTokenEncrypted: encrypt(tokens.refresh_token) },
    create: { userId, googleEmail, refreshTokenEncrypted: encrypt(tokens.refresh_token) },
  });
  return googleEmail;
}

export class GoogleError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function accessTokenFor(userId: string): Promise<string | null> {
  if (!googleConfigured()) return null;
  const account = await prisma.googleAccount.findUnique({ where: { userId } });
  if (!account) return null;
  try {
    const t = await tokenRequest({ refresh_token: decrypt(account.refreshTokenEncrypted), grant_type: "refresh_token" });
    return t.access_token;
  } catch (e) {
    // Access revoked in Google, or the secret changed: drop the dead link
    // so the UI shows "Connect" again instead of failing on every booking.
    if (e instanceof GoogleError && e.code === "invalid_grant") {
      await prisma.googleAccount.delete({ where: { userId } }).catch(() => {});
    }
    throw e;
  }
}

async function calendarFetch(token: string, url: string, init: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok && res.status !== 410) {
    const text = await res.text();
    throw new GoogleError(`http_${res.status}`, `Google Calendar error ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.status === 204 || res.status === 410 ? null : res.json();
}

// ─── Events ──────────────────────────────────────────────────────────

type EventInput = { title: string; description?: string | null; start: Date; durationMin: number; attendeeEmail?: string | null };

function eventBody(e: EventInput) {
  return {
    summary: e.title,
    description: e.description ?? undefined,
    start: { dateTime: e.start.toISOString(), timeZone: site.timeZone },
    end: { dateTime: new Date(+e.start + e.durationMin * 60_000).toISOString(), timeZone: site.timeZone },
    attendees: e.attendeeEmail ? [{ email: e.attendeeEmail }] : undefined,
    reminders: { useDefault: true },
  };
}

/**
 * Creates the event with a Meet link. Returns null when the mentor has
 * no connected calendar (caller falls back to their saved link).
 */
export async function createCalendarEvent(mentorId: string, e: EventInput): Promise<{ eventId: string; meetUrl: string | null } | null> {
  const token = await accessTokenFor(mentorId);
  if (!token) return null;
  const body = {
    ...eventBody(e),
    conferenceData: { createRequest: { requestId: randomBytes(12).toString("hex"), conferenceSolutionKey: { type: "hangoutsMeet" } } },
  };
  const created = (await calendarFetch(token, `${EVENTS_URL}?conferenceDataVersion=1&sendUpdates=all`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as { id: string; hangoutLink?: string; conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] } };
  const meetUrl = created.hangoutLink ?? created.conferenceData?.entryPoints?.find((p) => p.entryPointType === "video")?.uri ?? null;
  return { eventId: created.id, meetUrl };
}

export async function updateCalendarEvent(mentorId: string, eventId: string, e: Pick<EventInput, "start" | "durationMin">) {
  const token = await accessTokenFor(mentorId);
  if (!token) return;
  const { start, end } = eventBody({ title: "", ...e });
  await calendarFetch(token, `${EVENTS_URL}/${encodeURIComponent(eventId)}?sendUpdates=all`, {
    method: "PATCH",
    body: JSON.stringify({ start, end }),
  });
}

export async function cancelCalendarEvent(mentorId: string, eventId: string) {
  const token = await accessTokenFor(mentorId);
  if (!token) return;
  await calendarFetch(token, `${EVENTS_URL}/${encodeURIComponent(eventId)}?sendUpdates=all`, { method: "DELETE" });
}
