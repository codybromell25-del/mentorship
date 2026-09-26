import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { instructorCourse } from "@/content/instructors";

const columns = [
  {
    title: "Programmes",
    links: [
      { href: "/", label: "Studio mentorship" },
      { href: "/instructors", label: instructorCourse.name },
      { href: "/balancehq", label: "balanceHQ software" },
    ],
  },
  {
    title: "Free tools",
    links: [
      { href: "/studio-health-check", label: "Studio health check" },
      { href: "/teaching-confidence-check", label: "Teaching confidence check" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/apply", label: "Apply" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/images/balance-logo.jpg" alt="" width={36} height={36} className="rounded-full" />
            <span className="text-xl font-light tracking-wide text-ink">
              balance <span className="text-muted">mentorship</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            {site.tagline}. From the team behind balance studios and balance education.
          </p>
          <p className="mt-5 text-sm">
            <a href={`mailto:${site.contactEmail}`} className="text-ink underline decoration-border underline-offset-4 hover:decoration-ink">
              {site.contactEmail}
            </a>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          {columns.map((c) => (
            <div key={c.title}>
              <p className="text-xs tracking-[0.2em] text-muted uppercase">{c.title}</p>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink hover:text-accent">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-muted md:px-8">
          <p>© {new Date().getFullYear()} balance studios. All rights reserved.</p>
          <p>Made in Ireland</p>
        </div>
      </div>
    </footer>
  );
}
