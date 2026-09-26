import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Track } from "@prisma/client";
import { getOpenIntakes } from "@/lib/intakes";
import { formatDate, formatMoney } from "@/lib/format";
import { site } from "@/lib/site";
import { instructorCourse } from "@/content/instructors";
import { Container, Eyebrow } from "@/components/site/blocks";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "Apply", alternates: { canonical: "/apply" } };
export const dynamic = "force-dynamic";

const COPY: Record<Track, { who: string; eyebrow: string; title: string; intro: string; image: string; param: string }> = {
  STUDIO: {
    who: "I own or run a studio",
    eyebrow: "Studio mentorship",
    title: "Work with Kelly on your studio",
    intro: "Tell us about your studio and where you want to take it. Kelly reads every application personally.",
    image: "/images/tutor-kelly.jpg",
    param: "studio",
  },
  INSTRUCTOR: {
    who: "I teach Pilates (or I'm training)",
    eyebrow: instructorCourse.name,
    title: `Apply for ${instructorCourse.name}`,
    intro: "Tell us where you are and what you'd like to feel more confident about. We'll match you with the right mentor.",
    image: "/images/instructor-chat.jpg",
    param: "instructor",
  },
};

function parseTrack(value?: string): Track | null {
  if (value === "studio") return "STUDIO";
  if (value === "instructor" || value === "student") return "INSTRUCTOR";
  return null;
}

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ cohort?: string; track?: string }> }) {
  const sp = await searchParams;
  const [studio, instructor] = await Promise.all([getOpenIntakes("STUDIO"), getOpenIntakes("INSTRUCTOR")]);
  const all = [...studio, ...instructor];

  // A cohort link decides the track; otherwise ?track=, else ask.
  const fromCohort = studio.some((c) => c.id === sp.cohort) ? "STUDIO" : instructor.some((c) => c.id === sp.cohort) ? "INSTRUCTOR" : null;
  const track: Track | null = fromCohort ?? parseTrack(sp.track);

  if (!track) {
    return (
      <Container className="py-16 md:py-24">
        <Eyebrow>Apply</Eyebrow>
        <h1 className="mt-6 text-4xl text-ink md:text-5xl">Which sounds like you?</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">Applying is free and takes about ten minutes. We reply to everyone within a week.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {(["STUDIO", "INSTRUCTOR"] as const).map((t) => (
            <Link key={t} href={`/apply?track=${COPY[t].param}`} className="group overflow-hidden rounded-[2rem] border border-border bg-surface transition-colors hover:border-accent">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={COPY[t].image} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes="(min-width: 768px) 50vw, 100vw" />
              </div>
              <div className="flex items-end justify-between gap-4 p-7 md:p-8">
                <div>
                  <p className="text-xs tracking-[0.3em] text-accent uppercase">{COPY[t].eyebrow}</p>
                  <h2 className="mt-3 text-2xl text-ink md:text-3xl">{COPY[t].who}</h2>
                </div>
                <span aria-hidden className="text-2xl text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">→</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    );
  }

  const intakes = track === "STUDIO" ? studio : instructor;
  const copy = COPY[track];
  const chosen = all.find((c) => c.id === sp.cohort);

  return (
    <Container className="grid gap-14 py-16 md:py-20 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h1 className="mt-6 text-4xl leading-tight text-ink xl:text-5xl">{copy.title}</h1>
        <p className="mt-6 leading-relaxed text-muted">{copy.intro} Applying is free, and we reply within a week.</p>
        <div className="relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-[2rem] lg:block">
          <Image src={copy.image} alt="" fill className="object-cover" sizes="30vw" />
        </div>
      </aside>
      <div className="lg:col-span-7 lg:col-start-6">
        {intakes.length === 0 ? (
          <div className="card">
            <p className="text-ink">Applications are closed right now.</p>
            <p className="mt-1 text-sm text-muted">Email {site.contactEmail} to hear when the next intake opens.</p>
          </div>
        ) : (
          <ApplyForm
            track={track}
            defaultCohortId={chosen?.id}
            cohorts={intakes.map((c) => ({
              id: c.id,
              label: `${c.name} · starts ${formatDate(c.startDate)} · ${formatMoney(c.priceCents, c.currency)}${c.placesLeft <= 0 ? " · waitlist" : ""}`,
            }))}
          />
        )}
      </div>
    </Container>
  );
}
