import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/images/balance-logo.jpg" alt="" width={30} height={30} className="rounded-full" />
            <span className="text-xl font-light tracking-wide text-ink">
              balance <span className="text-muted">mentorship</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-5">
            <Link href="/#studio" className="hidden text-sm text-muted hover:text-ink md:block">Studio mentorship</Link>
            <Link href="/#students" className="hidden text-sm text-muted hover:text-ink md:block">Student pairing</Link>
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted">
          <p>© {new Date().getFullYear()} balance studios</p>
          <p>
            Questions? <a href={`mailto:${site.contactEmail}`} className="text-ink underline">{site.contactEmail}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
