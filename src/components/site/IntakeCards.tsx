import Link from "next/link";
import type { Intake } from "@/lib/intakes";
import { formatDate, formatMoney } from "@/lib/format";
import { site } from "@/lib/site";

/** Places-left meter. Numbers are real (see getOpenIntakes), never inflated. */
export function PlacesMeter({ left, capacity, light = false }: { left: number; capacity: number; light?: boolean }) {
  if (left <= 0) {
    return <p className={`text-sm ${light ? "text-gold" : "text-gold-ink"}`}>Full. Apply to join the waitlist.</p>;
  }
  const taken = ((capacity - left) / capacity) * 100;
  return (
    <div>
      <p className={`text-xs ${light ? "text-white/70" : "text-muted"}`}>
        <span className={`font-medium ${light ? "text-white" : "text-ink"}`}>{left}</span> of {capacity} places left
      </p>
      <div className={`mt-2 h-1 overflow-hidden rounded-full ${light ? "bg-white/15" : "bg-surface-muted"}`}>
        <div className={`h-full rounded-full ${light ? "bg-gold" : "bg-accent"}`} style={{ width: `${Math.max(taken, 4)}%` }} />
      </div>
    </div>
  );
}

export function IntakeCards({ intakes, applyHref }: { intakes: Intake[]; applyHref: string }) {
  if (intakes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-8">
        <p className="font-heading text-2xl text-ink italic">The next intake opens soon.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Email{" "}
          <a className="text-ink underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> and we&apos;ll
          let you know the moment applications open.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {intakes.map((c) => (
        <article key={c.id} className="rounded-3xl border border-border bg-surface p-7 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl text-ink">{c.name}</h3>
              <p className="mt-1 text-sm text-muted">
                {formatDate(c.startDate)} – {formatDate(c.endDate)}
              </p>
            </div>
            <p className="font-heading text-3xl text-ink">{formatMoney(c.priceCents, c.currency)}</p>
          </div>
          {c.description && <p className="mt-4 text-sm leading-relaxed text-muted">{c.description}</p>}
          <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <PlacesMeter left={c.placesLeft} capacity={c.capacity} />
            <Link href={`${applyHref}&cohort=${c.id}`} className="btn btn-accent">
              Apply
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Small floating card on the hero image showing the next intake. */
export function NextIntakeCard({ intake, applyHref }: { intake: Intake; applyHref: string }) {
  return (
    <Link
      href={`${applyHref}&cohort=${intake.id}`}
      className="block rounded-2xl border border-border bg-surface/95 p-5 shadow-[0_20px_60px_-20px_rgba(30,26,26,0.35)] backdrop-blur transition-transform hover:-translate-y-0.5"
    >
      <p className="text-[11px] tracking-[0.2em] text-muted uppercase">Next intake</p>
      <p className="mt-1 font-heading text-xl text-ink italic">Starts {formatDate(intake.startDate)}</p>
      <div className="mt-4">
        <PlacesMeter left={intake.placesLeft} capacity={intake.capacity} />
      </div>
    </Link>
  );
}
