import Image from "next/image";
import Link from "next/link";
import type { Cohort, Track } from "@prisma/client";
import { prisma } from "@/lib/db";
import { site } from "@/lib/site";
import { formatDate, formatMoney } from "@/lib/format";

// Cohort dates and prices come from the database, so render per request.
export const dynamic = "force-dynamic";

// COPY: placeholder wording — confirm with Kelly before launch.
const pillars = [
  {
    title: "Steady",
    image: "/images/studio-welcome.jpg",
    body: "Get the foundations right: cash flow, pricing, timetable and the systems that stop the studio running you.",
  },
  {
    title: "Grow",
    image: "/images/studio-wide.jpg",
    body: "Fill classes and keep clients coming back — memberships, marketing, community and when to add capacity.",
  },
  {
    title: "Run",
    image: "/images/instructor-helping.jpg",
    body: "Build and lead a team of instructors, protect the client experience, and step back without things slipping.",
  },
];

const studioSteps = [
  { title: "Apply", body: "Tell us about your studio: where it is, how long it's open, and what's keeping you up at night." },
  { title: "Studio deep-dive", body: "Kelly studies your studio case by case — numbers, timetable, team, pricing and client experience." },
  { title: "Your plan", body: "You get clear, prioritised advice built for your studio, not a generic template." },
  { title: "One-to-one sessions", body: "Regular sessions with Kelly to work through the plan, adjust, and tackle what comes up." },
];

const faqs = [
  {
    q: "Is studio mentorship only for balance-trained instructors?",
    a: "No. It's for anyone who owns, runs or is about to open a Pilates studio, wherever you trained.",
  },
  {
    q: "Do I need to be in Ireland?",
    a: "No. Sessions are online by default, so you can join from anywhere. In-person visits can be arranged.",
  },
  {
    q: "What happens after I apply?",
    a: "We review every application personally and reply within a week. If it's a fit, you'll get a link to confirm your place.",
  },
  {
    q: "What is student pairing?",
    a: "Students are matched with an experienced mentor from the balance team for regular one-to-one sessions and shared goals.",
  },
];

export default async function LandingPage() {
  const cohorts = await prisma.cohort.findMany({
    where: { isOpen: true, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
  });
  const studio = cohorts.filter((c) => c.track === "STUDIO");
  const students = cohorts.filter((c) => c.track === "STUDENT");

  return (
    <>
      {/* ─── Hero: studio mentorship with Kelly ─────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Image src="/images/interior-2.jpg" alt="The balance studio reformer room" fill priority className="-z-10 object-cover" sizes="100vw" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/35" />
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
          <p className="mb-5 text-xs tracking-[0.3em] text-accent-soft uppercase">Studio mentorship with Kelly O&apos;Neill</p>
          <h1 className="max-w-3xl text-5xl leading-[1.08] text-white md:text-6xl">
            Steady, grow and run your studio — with the founder of balance.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed font-light text-white/85">
            balance is the fastest-growing Pilates studio in Ireland. Now Kelly works one-to-one with studio owners,
            studying each studio case by case to help you build yours.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/apply?track=studio" className="btn btn-accent">Apply for studio mentorship</Link>
            <Link href="#students" className="btn border border-white/40 text-white hover:bg-white/10">Student pairing</Link>
          </div>
        </div>
      </section>

      {/* ─── About Kelly ────────────────────────────────────────────── */}
      <section id="studio" className="scroll-mt-16 bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[5fr_7fr] md:py-28">
          <div className="relative aspect-[5/7] overflow-hidden rounded-2xl">
            <Image src="/images/tutor-kelly.jpg" alt="Kelly O'Neill in the balance studio" fill className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1 text-xs tracking-[0.3em] text-accent uppercase">Your mentor</span>
            <h2 className="mt-6 text-4xl leading-tight text-ink md:text-5xl">Kelly O&apos;Neill</h2>
            <p className="mt-3 text-xs tracking-[0.3em] text-muted uppercase">Founder · balance studios</p>
            <div className="mt-8 space-y-4 leading-relaxed text-muted">
              {/* COPY: confirm Kelly's story and numbers before launch. */}
              <p>
                Kelly built balance into the fastest-growing Pilates studio in Ireland. She has done the hard parts
                herself: finding the space, filling the timetable, hiring and training instructors, and keeping clients
                coming back.
              </p>
              <p>
                Studio mentorship puts that experience to work on your business. Kelly looks at your studio case by case
                — no templates — and gives honest, practical advice on what to fix first, where to grow, and how to run
                it without burning out.
              </p>
            </div>
            <Link href="/apply?track=studio" className="btn btn-primary mt-10">Apply to work with Kelly</Link>
          </div>
        </div>
      </section>

      {/* ─── Steady / Grow / Run ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="eyebrow mb-4">What we work on</p>
          <h2 className="text-4xl leading-tight text-ink">Advice for every stage of your studio.</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.title} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative aspect-[4/3]">
                <Image src={p.image} alt="" fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── How studio mentorship works + studio cohorts ───────────── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="eyebrow mb-4">How it works</p>
          <h2 className="mb-14 text-4xl text-ink">Case by case, studio by studio.</h2>
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {studioSteps.map((s, i) => (
              <li key={s.title}>
                <p className="font-heading text-4xl text-gold italic">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-xl text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16">
            <CohortCards cohorts={studio} track="STUDIO" />
          </div>
        </div>
      </section>

      {/* ─── Image strip ───────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4" aria-hidden>
        {["/images/studio-bray-hero.jpg", "/images/pillar-3-attic.jpg", "/images/why-balance-hallway.jpg", "/images/studio-mirror.jpg"].map((src) => (
          <div key={src} className="relative aspect-square">
            <Image src={src} alt="" fill className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" />
          </div>
        ))}
      </section>

      {/* ─── Student pairing ───────────────────────────────────────── */}
      <section id="students" className="scroll-mt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-block rounded-full bg-gold/15 px-4 py-1 text-xs tracking-[0.3em] text-gold-ink uppercase">Student pairing</span>
            <h2 className="mt-6 text-4xl leading-tight text-ink">Learn alongside someone who&apos;s been there.</h2>
            {/* COPY: confirm who student pairing is for and what's included. */}
            <p className="mt-6 leading-relaxed text-muted">
              We pair students with an experienced mentor from the balance team. You&apos;ll meet one-to-one, set goals
              together, and get honest feedback as you build your teaching and your confidence.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink">
              <li>— Matched with a mentor who fits your goals</li>
              <li>— Regular one-to-one sessions, with notes after each</li>
              <li>— Shared goals you track in your dashboard</li>
            </ul>
            <div className="mt-10">
              <CohortCards cohorts={students} track="STUDENT" compact />
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image src="/images/instructor-chat.jpg" alt="A balance instructor guiding a student on the reformer" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="mb-8 text-3xl text-ink">Questions</h2>
          <div className="divide-y divide-border">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
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

function CohortCards({ cohorts, track, compact = false }: { cohorts: Cohort[]; track: Track; compact?: boolean }) {
  const param = track === "STUDIO" ? "studio" : "student";
  if (cohorts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-6 text-sm text-muted">
        No intakes are open right now. Email{" "}
        <a className="text-ink underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> to hear when the next one opens.
      </div>
    );
  }
  return (
    <div className={`grid gap-5 ${compact ? "" : "md:grid-cols-3"}`}>
      {cohorts.map((c) => (
        <div key={c.id} className="flex flex-col rounded-2xl border border-border bg-background p-6">
          <h3 className="text-xl text-ink">{c.name}</h3>
          <p className="mt-1 text-sm text-muted">
            Starts {formatDate(c.startDate)} · {c.capacity} places
          </p>
          {c.description && !compact && <p className="mt-4 text-sm leading-relaxed text-muted">{c.description}</p>}
          <div className="mt-auto flex items-end justify-between gap-4 pt-6">
            <p className="font-heading text-3xl text-ink">{formatMoney(c.priceCents, c.currency)}</p>
            <Link href={`/apply?track=${param}&cohort=${c.id}`} className="btn btn-primary btn-sm">Apply</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
