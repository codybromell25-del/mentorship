import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectGoogle } from "@/lib/google";
import { appUrl } from "@/lib/site";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const settings = `${appUrl()}/mentor/settings`;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(`${appUrl()}/login`);

  const jar = await cookies();
  const expected = jar.get("google_oauth_state")?.value;
  jar.delete({ name: "google_oauth_state", path: "/api/google" });

  if (url.searchParams.get("error")) return NextResponse.redirect(`${settings}?google=denied`);
  const code = url.searchParams.get("code");
  if (!code || !expected || url.searchParams.get("state") !== expected) {
    return NextResponse.redirect(`${settings}?google=error`);
  }

  try {
    await connectGoogle(session.user.id, code);
    return NextResponse.redirect(`${settings}?google=connected`);
  } catch (e) {
    console.error("[google] connect failed:", e);
    return NextResponse.redirect(`${settings}?google=error`);
  }
}
