import Image from "next/image";
import Link from "next/link";
import type { Shift } from "@/content/studio";

/*
 * Building blocks for the public marketing pages. Pages compose these
 * with copy from src/content/*, so layout and wording stay separate.
 */

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-5 md:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, tone = "accent" }: { children: React.ReactNode; tone?: "accent" | "gold" | "light" }) {
  const color = tone === "gold" ? "text-gold" : tone === "light" ? "text-accent-soft" : "text-accent";
  const line = tone === "gold" ? "bg-gold" : tone === "light" ? "bg-accent-soft" : "bg-accent";
  return (
    <p className={`flex items-center gap-3 text-xs tracking-[0.3em] uppercase ${color}`}>
      <span className={`h-px w-8 ${line}`} aria-hidden />
      {children}
    </p>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  intro,
  dark = false,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`reveal max-w-3xl ${className}`}>
      {eyebrow && <Eyebrow tone={dark ? "gold" : "accent"}>{eyebrow}</Eyebrow>}
      <h2 className={`mt-5 text-4xl leading-[1.12] md:text-5xl ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
      {intro && <p className={`mt-6 text-lg leading-relaxed ${dark ? "text-white/75" : "text-muted"}`}>{intro}</p>}
    </div>
  );
}

/** Two-line hero headline: an upright first line and an italic, coloured second line. */
export function HeroTitle({ lineOne, lineTwo }: { lineOne: string; lineTwo: string }) {
  return (
    <h1 className="text-[2.6rem] leading-[1.06] text-ink sm:text-6xl lg:text-[4.4rem]">
      <span className="block not-italic">{lineOne}</span>
      <span className="mt-1 block text-accent">{lineTwo}</span>
    </h1>
  );
}

export function ArrowLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2 text-sm font-medium ${light ? "text-white" : "text-ink"}`}>
      <span className={`underline decoration-1 underline-offset-[6px] ${light ? "decoration-white/40 group-hover:decoration-white" : "decoration-border group-hover:decoration-ink"}`}>
        {children}
      </span>
      <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}

/** The dark "inner voice" section: numbered, specific, uncomfortable-but-kind statements. */
export function PainSection({
  eyebrow,
  title,
  items,
  closing,
  children,
}: {
  eyebrow: string;
  title: string;
  items: string[];
  closing: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-ink text-white">
      <Container className="py-24 md:py-32">
        <SectionIntro eyebrow={eyebrow} title={title} dark />
        <ul className="reveal mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2">
          {items.map((t, i) => (
            <li key={t} className="bg-ink p-7 md:p-10">
              <span className="font-heading text-sm text-gold italic">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-4 font-heading text-xl leading-snug text-white/90 italic md:text-[1.6rem]">{t}</p>
            </li>
          ))}
        </ul>
        <div className="reveal mt-16 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="text-xl leading-relaxed text-white md:col-span-8 md:text-2xl">{closing}</p>
          {children && <div className="md:col-span-4 md:text-right">{children}</div>}
        </div>
      </Container>
    </section>
  );
}

export function ShiftList({ shifts }: { shifts: Shift[] }) {
  return (
    <ul className="space-y-5">
      {shifts.map((s) => (
        <li key={s.from} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <span className="pt-0.5 text-[10px] tracking-[0.2em] text-muted uppercase">From</span>
          <span className="text-sm text-muted">{s.from}</span>
          <span className="pt-0.5 text-[10px] tracking-[0.2em] text-accent uppercase">To</span>
          <span className="text-sm font-medium text-ink">{s.to}</span>
        </li>
      ))}
    </ul>
  );
}

export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="reveal grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
      {steps.map((s, i) => (
        <li key={s.title} className="border-t border-border pt-6">
          <p className="font-heading text-5xl text-gold italic">{String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-4 text-xl text-ink">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function IncludedList({ items, title = "What's included" }: { items: string[]; title?: string }) {
  return (
    <div>
      <h3 className="text-2xl text-ink">{title}</h3>
      <ul className="mt-6 space-y-4">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-sm text-ink">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="10" cy="10" r="9.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 10.2l2.6 2.6L14 7.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Faq({ items, title = "Questions, answered" }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section className="border-t border-border">
      <Container className="grid gap-12 py-24 md:py-28 lg:grid-cols-12">
        <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <h2 className="text-4xl text-ink">{title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Something else on your mind? Email us and a real person will reply.
          </p>
        </div>
        <div className="divide-y divide-border border-y border-border lg:col-span-8">
          {items.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg text-ink">
                {f.q}
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Soft green band pointing hesitant visitors at a free self-check. */
export function CheckBand({ eyebrow, title, body, href, label }: { eyebrow: string; title: string; body: string; href: string; label: string }) {
  return (
    <Container className="py-8">
      <div className="reveal relative isolate overflow-hidden rounded-[2rem] bg-accent px-7 py-14 text-white md:px-14 md:py-16">
        <div className="absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full border border-white/10" aria-hidden />
        <div className="absolute -right-8 -bottom-32 -z-10 h-72 w-72 rounded-full border border-white/10" aria-hidden />
        <div className="grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8">
            <Eyebrow tone="light">{eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl leading-tight text-white md:text-4xl">{title}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-white/80">{body}</p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link href={href} className="btn btn-gold">{label}</Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

export function FinalCta({
  title,
  body,
  image,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  image: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <Image src={image} alt="" fill className="-z-10 object-cover" sizes="100vw" />
      <div className="absolute inset-0 -z-10 bg-ink/75" />
      <Container className="py-28 text-center md:py-36">
        <h2 className="reveal mx-auto max-w-3xl text-4xl leading-tight text-white md:text-6xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80">{body}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Link href={primary.href} className="btn btn-gold">{primary.label}</Link>
          {secondary && <ArrowLink href={secondary.href} light>{secondary.label}</ArrowLink>}
        </div>
      </Container>
    </section>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so the JSON can't close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
