import Image from "next/image";
import Link from "next/link";
import { SITE_NAV } from "./nav";
import { DesktopNav, MobileMenu } from "./SiteNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="balance mentorship, home">
          <Image src="/images/balance-logo.jpg" alt="" width={30} height={30} className="rounded-full" priority />
          <span className="text-lg font-light tracking-wide text-ink md:text-xl">
            balance <span className="text-muted">mentorship</span>
          </span>
        </Link>
        <DesktopNav items={SITE_NAV} />
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-muted hover:text-ink sm:block">Sign in</Link>
          <Link href="/apply" className="btn btn-primary btn-sm hidden sm:inline-flex">Apply</Link>
          <MobileMenu items={SITE_NAV} />
        </div>
      </div>
    </header>
  );
}
