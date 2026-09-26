import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authUrl, googleConfigured } from "@/lib/google";
import { appUrl } from "@/lib/site";

/** Starts the Google OAuth flow for the signed-in mentor. */
export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "MENTOR" && role !== "ADMIN")) {
    return NextResponse.redirect(`${appUrl()}/login`);
  }
  if (!googleConfigured()) {
    return NextResponse.redirect(`${appUrl()}/mentor/settings?google=not-configured`);
  }

  // CSRF protection: the callback must return the same random state.
  const state = randomBytes(24).toString("base64url");
  (await cookies()).set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/api/google",
  });
  return NextResponse.redirect(authUrl(state));
}
