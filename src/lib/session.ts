import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

/**
 * Server-side guard for pages and server actions. The proxy already
 * bounces anonymous visitors, but every action re-checks because
 * actions can be called directly.
 */
export async function requireUser(roles?: Role[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (roles && !roles.includes(session.user.role as Role)) redirect(homeFor(session.user.role));
  return session.user as { id: string; name: string; email: string; role: Role };
}

export function homeFor(role: string | undefined): string {
  if (role === "ADMIN") return "/admin";
  if (role === "MENTOR") return "/mentor";
  return "/dashboard";
}
