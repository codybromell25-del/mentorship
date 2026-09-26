import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { homeFor } from "@/lib/session";
import { accountsEnabled } from "@/lib/config";

/**
 * Next 16 route proxy (formerly middleware.ts).
 *
 *   /dashboard/** — any signed-in user (mentees)
 *   /mentor/**    — MENTOR or ADMIN
 *   /admin/**     — ADMIN only
 *   /login        — signed-in users go to their home area
 *
 * Pages and server actions re-check with requireUser(); this is the
 * first line of defence, not the only one.
 */
const withAuth = auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth;

  const gated = ["/dashboard", "/mentor", "/admin"].some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (gated && !isLoggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(homeFor(role), req.url));
  }
  if (pathname.startsWith("/mentor") && role !== "MENTOR" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(homeFor(role), req.url));
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL(homeFor(role), req.url));
  }

  return NextResponse.next();
});

export default function proxy(req: NextRequest) {
  // A deployment without a database or AUTH_SECRET serves the public site
  // only: show a friendly page here instead of a server error.
  if (!accountsEnabled()) {
    return NextResponse.rewrite(new URL("/unavailable", req.url));
  }
  // Our callback ignores the second (route-context) argument.
  return withAuth(req, { params: Promise.resolve({}) });
}

export const config = {
  matcher: ["/dashboard/:path*", "/mentor/:path*", "/admin/:path*", "/login", "/home", "/setup"],
};
