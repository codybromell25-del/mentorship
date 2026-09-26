import Link from "next/link";
import { prisma } from "@/lib/db";
import { site } from "@/lib/site";
import { formatDate, formatMoney } from "@/lib/format";

// Cohort dates and prices come from the database, so render per request.
export const dynamic = "force-dynamic";

const steps = [
  { title: "Apply", body: "Tell us where you are and where you want to get to. It takes about ten minutes." },
  { title: "Get matched", body: "We pair you with a mentor whose experience fits your goals." },
  { title: "Meet every fortnight", body: "Six focused one-to-one sessions, with notes and action points after each." },
  { title: "Track your goals", body: "Set goals with your mentor and track progress in your dashboard." },
];

const faqs = [
  {
    q: "How much time does it take?",
    a: "Plan for a 45-minute session every two weeks, plus an hour or two between sessions working on your goals.",
  },
  {
    q: "Are sessions online?",
    a: "Yes, by default. Your mentor will share a video link for each session. In-person sessions are possible where you are both local.",
  },
  {
    q: "What happens after I apply?",
    a: "We review every application personally and reply within a week. If you're accepted, you'll get a link to confirm your place.",
  },
  {
    q: "Can I get a refund?",
    a: "If you withdraw before your first session, we'll refund you in full.",
  },
];

export default async function LandingPage() {
  const cohorts = await prisma.cohort.findMany({
    where: { isOpen: true, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    take: 3,
  });
  const next = cohorts[0];

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28">
        <p className="eyebrow mb-5">{site.tagline}</p>
        <h1 className="max-w-3xl text-5xl leading-[1.05] text-ink md:text-6xl">
          The right mentor changes how fast you grow.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{site.description}</p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/apply" className="btn btn-accent px-7 py-3 text-base">
            Apply now
          </Link>
          {next && (
            <p className="text-sm text-muted">
              Next cohort starts <span className="font-medium text-ink">{formatDate(next.startDate)}</span>
            </p>
          )}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-12 text-3xl text-ink">How it works</h2>
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title}>
                <p className="font-heading text-4xl text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-lg text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-3xl text-ink">Upcoming cohorts</h2>
        {cohorts.length === 0 ? (
          <div className="card max-w-xl">
            <p className="text-ink">No cohorts are open right now.</p>
            <p className="mt-1 text-sm text-muted">
              Email <a className="underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> to hear when
              the next one opens.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {cohorts.map((c) => (
              <div key={c.id} className="card flex flex-col">
                <h3 className="text-xl text-ink">{c.name}</h3>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(c.startDate)} – {formatDate(c.endDate)}
                </p>
                {c.description && <p className="mt-4 text-sm leading-relaxed text-muted">{c.description}</p>}
                <div className="mt-auto flex items-end justify-between pt-6">
                  <div>
                    <p className="font-heading text-3xl text-ink">{formatMoney(c.priceCents, c.currency)}</p>
                    <p className="text-xs text-muted">{c.capacity} places</p>
                  </div>
                  <Link href={`/apply?cohort=${c.id}`} className="btn btn-primary btn-sm">
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="mb-8 text-3xl text-ink">Questions</h2>
          <div className="divide-y divide-border">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
                  {f.q}
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
