"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { NavItem } from "./nav";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
      {items.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`relative text-sm transition-colors hover:text-ink ${active ? "text-ink after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:bg-accent" : "text-muted"}`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Full-width menu for phones and tablets. Closes on navigation and Escape. */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close when the route changes (render-time reset, no effect needed).
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    // Stop the page behind the menu from scrolling.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => {
          setOpen((o) => !o);
          setOpenedAt(pathname);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          {open ? (
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {/* Portalled to <body>: the header's backdrop blur would otherwise
          become the containing block for this fixed panel. */}
      {open &&
        createPortal(
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-background px-5 pt-6 pb-10 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col divide-y divide-border">
            {items.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(pathname, n.href) ? "page" : undefined}
                className="py-4 font-heading text-2xl text-ink italic"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <Link href="/apply?track=studio" onClick={() => setOpen(false)} className="btn btn-accent">Apply: studio mentorship</Link>
            <Link href="/apply?track=instructor" onClick={() => setOpen(false)} className="btn btn-ghost">Apply: instructors</Link>
            <Link href="/login" onClick={() => setOpen(false)} className="py-2 text-center text-sm text-muted underline">Sign in</Link>
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
