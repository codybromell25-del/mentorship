import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/auth";

export type NavItem = { href: string; label: string };

/** Top-nav shell shared by the mentee, mentor and admin areas. */
export function AppShell({
  nav,
  userName,
  area,
  children,
}: {
  nav: NavItem[];
  userName: string;
  area: string;
  children: React.ReactNode;
}) {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 text-xl font-light tracking-wide text-ink">
              <Image src="/images/balance-logo.jpg" alt="" width={28} height={28} className="rounded-full" />
              balance
              <span className="ml-2 align-middle font-body text-xs tracking-wide text-muted uppercase">{area}</span>
            </Link>
            <nav className="hidden items-center gap-5 md:flex">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-sm text-muted transition-colors hover:text-ink">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:block">{userName}</span>
            <form action={logout}>
              <button className="btn btn-ghost btn-sm">Sign out</button>
            </form>
          </div>
        </div>
        <nav className="flex gap-5 overflow-x-auto px-6 pb-3 md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="shrink-0 text-sm text-muted hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
