import Link from "next/link";
import { site } from "@/lib/site";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-heading text-xl text-ink">
            {site.name}
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href="/apply" className="btn btn-primary btn-sm">
              Apply
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <p>
            Questions? <a href={`mailto:${site.contactEmail}`} className="text-ink underline">{site.contactEmail}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
