import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { appUrl } from "@/lib/site";
import { getOpenIntakes } from "@/lib/intakes";
import {
  instructorAudiences,
  instructorCourse,
  instructorFaqs,
  instructorFinalCta,
  instructorHero,
  instructorIncluded,
  instructorModules,
  instructorPains,
  instructorReframe,
  instructorShifts,
  instructorSteps,
} from "@/content/instructors";
import {
  ArrowLink,
  CheckBand,
  Container,
  Eyebrow,
  Faq,
  FinalCta,
  HeroTitle,
  IncludedList,
  JsonLd,
  PainSection,
  SectionIntro,
  ShiftList,
  Steps,
} from "@/components/site/blocks";
import { IntakeCards, NextIntakeCard } from "@/components/site/IntakeCards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${instructorCourse.name}: mentorship for Pilates instructors`,
  description: `${instructorCourse.name} is a mentorship course for Pilates instructors in Ireland who want to teach with calm, clear confidence, paired with a mentor from the balance team.`,
  alternates: { canonical: "/instructors" },
};

const APPLY = "/apply?track=instructor";

export default async function InstructorsPage() {
  const intakes = await getOpenIntakes("INSTRUCTOR");
  const next = intakes[0];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: instructorCourse.name,
          description: instructorHero.intro,
          provider: { "@type": "Organization", name: "balance studios", sameAs: appUrl() },
          hasCourseInstance: intakes.map((c) => ({
            "@type": "CourseInstance",
            name: c.name,
            courseMode: "online",
            startDate: c.startDate.toISOString().slice(0, 10),
            endDate: c.endDate.toISOString().slice(0, 10),
          })),
        }}
      />

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Container className="grid gap-14 pt-12 pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-32">
          <div className="lg:col-span-7 lg:pt-10">
            <Eyebrow>{instructorHero.eyebrow}</Eyebrow>
            <div className="mt-8">
              <HeroTitle lineOne={instructorHero.lineOne} lineTwo={instructorHero.lineTwo} />
            </div>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">{instructorHero.intro}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href={APPLY} className="btn btn-accent">Apply for {instructorCourse.name}</Link>
              <ArrowLink href="/teaching-confidence-check">Take the free teaching confidence check</ArrowLink>
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:aspect-auto lg:h-full lg:min-h-[600px]">
              <Image
                src="/images/reformer-stretch.jpg"
                alt="An instructor teaching a reformer class at balance"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
            {next && (
              <div className="absolute right-4 -bottom-8 left-4 sm:right-auto sm:left-6 sm:w-72 lg:-left-10">
                <NextIntakeCard intake={next} applyHref={APPLY} />
              </div>
            )}
          </div>
        </Container>
      </section>

      <PainSection {...instructorPains}>
        <Link href="#course" className="btn btn-gold">See how we fix it</Link>
      </PainSection>

      {/* ─── Reframe ───────────────────────────────────────────────── */}
      <section>
        <Container className="grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <SectionIntro eyebrow={instructorReframe.eyebrow} title={instructorReframe.title} />
            <div className="reveal mt-8 space-y-5 text-lg leading-relaxed text-muted">
              {instructorReframe.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="reveal relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:col-span-5">
            <Image src="/images/instructor-helping.jpg" alt="Instructors from the balance team working together" fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
        </Container>
      </section>

      {/* ─── Course: six focus areas ───────────────────────────────── */}
      <section id="course" className="scroll-mt-20 border-y border-border bg-surface">
        <Container className="py-24 md:py-32">
          <SectionIntro
            eyebrow={`Inside ${instructorCourse.name}`}
            title="Six things confident instructors do differently."
            intro="Your mentor tailors the course to you, spending the most time where you need it. These are the six areas we work through."
          />
          <ol className="reveal mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-border sm:grid-cols-2 lg:grid-cols-3">
            {instructorModules.map((m, i) => (
              <li key={m.title} className="bg-surface p-8 md:p-10">
                <p className="font-heading text-sm text-gold italic">Module {String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-2xl text-ink">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{m.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ─── What changes + who it's for ───────────────────────────── */}
      <section>
        <Container className="grid gap-16 py-24 md:py-32 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionIntro eyebrow="What changes" title="From second-guessing to second nature." />
            <div className="reveal mt-12 rounded-[2rem] border border-border bg-surface p-8 md:p-10">
              <ShiftList shifts={instructorShifts} />
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SectionIntro eyebrow="Who it's for" title="Wherever you are right now." />
            <ul className="reveal mt-12 divide-y divide-border border-y border-border">
              {instructorAudiences.map((a) => (
                <li key={a.title} className="py-6">
                  <p className="font-heading text-xl text-ink italic">{a.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{a.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ─── How it works + intakes ────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-border">
        <Container className="py-24 md:py-32">
          <SectionIntro eyebrow="How it works" title="Class by class, you get better." />
          <div className="mt-16">
            <Steps steps={instructorSteps} />
          </div>
          <div className="mt-24 grid gap-14 lg:grid-cols-12">
            <div className="reveal lg:col-span-5">
              <IncludedList items={instructorIncluded} />
            </div>
            <div id="intakes" className="reveal scroll-mt-24 lg:col-span-7">
              <h3 className="mb-6 text-2xl text-ink">Upcoming intakes</h3>
              <IntakeCards intakes={intakes} applyHref={APPLY} />
            </div>
          </div>
        </Container>
      </section>

      <CheckBand
        eyebrow="Not sure yet?"
        title="How confident is your teaching, really?"
        body="Eight quick questions about how teaching feels right now, and one thing to try in your next class. Your answers aren't stored."
        href="/teaching-confidence-check"
        label="Take the confidence check"
      />

      <div className="h-24" />
      <Faq items={instructorFaqs} />

      <FinalCta
        title={instructorFinalCta.title}
        body={instructorFinalCta.body}
        image="/images/reformer-class.jpg"
        primary={{ href: APPLY, label: `Apply for ${instructorCourse.name}` }}
        secondary={{ href: "/teaching-confidence-check", label: "Take the free confidence check" }}
      />
    </>
  );
}
