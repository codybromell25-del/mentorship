import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Track } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { site } from "@/lib/site";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "Apply" };
export const dynamic = "force-dynamic";

const COPY: Record<Track, { eyebrow: string; title: string; intro: string; image: string }> = {
  STUDIO: {
    eyebrow: "Studio mentorship",
    title: "Work with Kelly on your studio",
    intro: "Tell us about your studio and where you want to take it. Kelly reads every application personally.",
    image: "/images/tutor-kelly.jpg",
  },
  STUDENT: {
    eyebrow: "Student pairing",
    title: "Get paired with a mentor",
    intro: "Tell us where you are and what you want to work on, and we'll match you with the right mentor.",
    image: "/images/instructor-chat.jpg",
  },
};

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ cohort?: string; track?: string }> }) {
  const sp = await searchParams;
  const open = await prisma.cohort.findMany({
    where: { isOpen: true, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
  });

  // A cohort link decides the track; otherwise ?track=, else ask.
  const fromCohort = open.find((c) => c.id === sp.cohort)?.track;
  const track: Track | null = fromCohort ?? (sp.track === "studio" ? "STUDIO" : sp.track === "student" ? "STUDENT" : null);

  if (!track) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="eyebrow mb-3">Apply</p>
        <h1 className="mb-10 text-4xl text-ink">Which programme?</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {(["STUDIO", "STUDENT"] as const).map((t) => (
            <Link key={t} href={`/apply?track=${t === "STUDIO" ? "studio" : "student"}`} className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent">
              <div className="relative aspect-[16/10]">
                <Image src={COPY[t].image} alt="" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
              </div>
              <div className="p-6">
                <p className="eyebrow mb-2">{COPY[t].eyebrow}</p>
                <h2 className="text-2xl text-ink">{COPY[t].title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const cohorts = open.filter((c) => c.track === track);
  const copy = COPY[track];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow mb-3">{copy.eyebrow}</p>
      <h1 className="text-4xl text-ink">{copy.title}</h1>
      <p className="mt-4 mb-10 leading-relaxed text-muted">{copy.intro} Applying is free, and we reply within a week.</p>
      {cohorts.length === 0 ? (
        <div className="card">
          <p className="text-ink">Applications are closed right now.</p>
          <p className="mt-1 text-sm text-muted">Email {site.contactEmail} to hear when the next intake opens.</p>
        </div>
      ) : (
        <ApplyForm
          track={track}
          defaultCohortId={sp.cohort}
          cohorts={cohorts.map((c) => ({
            id: c.id,
            label: `${c.name} · starts ${formatDate(c.startDate)} · ${formatMoney(c.priceCents, c.currency)}`,
          }))}
        />
      )}
    </div>
  );
}
