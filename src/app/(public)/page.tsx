import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { appUrl } from "@/lib/site";
import { getOpenIntakes } from "@/lib/intakes";
import {
  hqTeaser,
  kellyNote,
  studioFaqs,
  studioFinalCta,
  studioHero,
  studioIncluded,
  studioPains,
  studioPillars,
  studioReframe,
  studioSteps,
} from "@/content/studio";
import { instructorCourse, instructorTeaser } from "@/content/instructors";
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

// Intake dates, prices and places come from the database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Studio mentorship for Pilates studio owners in Ireland | balance mentorship" },
  description:
    "One-to-one mentorship with Kelly O'Neill, founder of balance, Ireland's fastest-growing Pilates studio. Steady your studio, grow it and run it, without it running you.",
  alternates: { canonical: "/" },
};

const APPLY = "/apply?track=studio";

export default async function HomePage() {
  const intakes = await getOpenIntakes("STUDIO");
  const next = intakes[0];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Studio mentorship with Kelly O'Neill",
          serviceType: "Business mentorship for Pilates studio owners",
          description: studioHero.intro,
          areaServed: { "@type": "Country", name: "Ireland" },
          provider: { "@type": "Organization", name: "balance studios", url: appUrl() },
          offers: intakes.map((c) => ({
            "@type": "Offer",
            name: c.name,
            price: (c.priceCents / 100).toFixed(2),
            priceCurrency: c.currency.toUpperCase(),
            availability: c.placesLeft > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            url: `${appUrl()}${APPLY}&cohort=${c.id}`,
          })),
        }}
      />

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Container className="grid gap-14 pt-12 pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-32">
          <div className="lg:col-span-7 lg:pt-10">
            <Eyebrow>{studioHero.eyebrow}</Eyebrow>
            <div className="mt-8">
              <HeroTitle lineOne={studioHero.lineOne} lineTwo={studioHero.lineTwo} />
            </div>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">{studioHero.intro}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href={APPLY} className="btn btn-accent">Apply for studio mentorship</Link>
              <ArrowLink href="/studio-health-check">Take the free 2-minute studio health check</ArrowLink>
            </div>
            <div className="mt-14 flex items-center gap-4 border-t border-border pt-7">
              <Image src="/images/tutor-kelly.jpg" alt="" width={112} height={112} className="h-14 w-14 rounded-full object-cover object-top" />
              <p className="text-sm leading-snug text-muted">
                <span className="font-medium text-ink">Kelly O&apos;Neill</span>
                <br />
                Founder of balance, Ireland&apos;s fastest-growing Pilates studio
              </p>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:aspect-auto lg:h-full lg:min-h-[600px]">
              <Image
                src="/images/studio-reformers-row.jpg"
                alt="A row of reformers in the balance studio"
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

      {/* ─── The pain nobody posts about ───────────────────────────── */}
      <PainSection {...studioPains}>
        <Link href="#kelly" className="btn btn-gold">That&apos;s what Kelly is for</Link>
      </PainSection>

      {/* ─── Reframe + Kelly ───────────────────────────────────────── */}
      <section id="kelly" className="scroll-mt-20">
        <Container className="grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:sticky lg:top-28">
              <Image src="/images/tutor-kelly.jpg" alt="Kelly O'Neill in the balance studio" fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          </div>
          <div className="lg:col-span-7 lg:pt-6">
            <SectionIntro eyebrow={studioReframe.eyebrow} title={studioReframe.title} />
            <div className="reveal mt-8 space-y-5 text-lg leading-relaxed text-muted">
              {studioReframe.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <figure className="reveal mt-14 rounded-[2rem] border border-border bg-surface p-8 md:p-12">
              <p className="text-xs tracking-[0.3em] text-accent uppercase">A note from Kelly</p>
              <blockquote className="mt-6 space-y-5 font-heading text-lg leading-relaxed text-ink italic md:text-xl">
                {kellyNote.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </blockquote>
              <figcaption className="mt-8 border-t border-border pt-6">
                <p className="font-heading text-2xl text-ink italic">{kellyNote.name}</p>
                <p className="mt-1 text-xs tracking-[0.2em] text-muted uppercase">{kellyNote.role}</p>
              </figcaption>
            </figure>
          </div>
        </Container>
      </section>

      {/* ─── Steady / Grow / Run ───────────────────────────────────── */}
      <section className="border-y border-border bg-surface">
        <Container className="py-24 md:py-32">
          <SectionIntro
            eyebrow="What changes"
            title="Three things we fix, in the right order."
            intro="Every studio is different, so Kelly starts with yours. But almost every plan comes back to the same three things."
          />
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {studioPillars.map((p) => (
              <article key={p.title} className="reveal flex flex-col overflow-hidden rounded-[2rem] border border-border bg-background">
                <div className="relative aspect-[16/11]">
                  <Image src={p.image} alt="" fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
                </div>
                <div className="flex flex-1 flex-col p-7 md:p-8">
                  <h3 className="text-3xl text-ink">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{p.lead}</p>
                  <div className="mt-7 border-t border-border pt-7">
                    <ShiftList shifts={p.shifts} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── How it works + intakes ────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20">
        <Container className="py-24 md:py-32">
          <SectionIntro eyebrow="How it works" title="Case by case, studio by studio." />
          <div className="mt-16">
            <Steps steps={studioSteps} />
          </div>
          <div className="mt-24 grid gap-14 lg:grid-cols-12">
            <div className="reveal lg:col-span-5">
              <IncludedList items={studioIncluded} />
            </div>
            <div id="intakes" className="reveal scroll-mt-24 lg:col-span-7">
              <h3 className="mb-6 text-2xl text-ink">Upcoming intakes</h3>
              <IntakeCards intakes={intakes} applyHref={APPLY} />
            </div>
          </div>
        </Container>
      </section>

      <CheckBand
        eyebrow="Not ready to apply?"
        title="How healthy is your studio, really?"
        body="Eight honest questions, two minutes, and a clear picture of where to focus first. Your answers aren't stored."
        href="/studio-health-check"
        label="Take the health check"
      />

      {/* ─── balanceHQ (sold separately) ───────────────────────────── */}
      <section className="mt-24 bg-ink text-white">
        <Container className="grid gap-14 py-24 md:py-28 lg:grid-cols-12 lg:items-center">
          <div className="reveal lg:col-span-6">
            <Eyebrow tone="gold">{hqTeaser.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-4xl leading-tight text-white md:text-5xl">{hqTeaser.title}</h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">{hqTeaser.body}</p>
            <div className="mt-10">
              <ArrowLink href="/balancehq" light>Explore balanceHQ</ArrowLink>
            </div>
          </div>
          <ul className="reveal space-y-4 lg:col-span-6">
            {hqTeaser.questions.map((q, i) => (
              <li key={q} className="flex items-baseline gap-5 rounded-2xl border border-white/10 px-6 py-5">
                <span className="font-heading text-sm text-gold italic">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-heading text-xl text-white/90 italic md:text-2xl">{q}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ─── For instructors ───────────────────────────────────────── */}
      <section>
        <Container className="grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:items-center">
          <div className="reveal relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:col-span-5">
            <Image src="/images/instructor-chat.jpg" alt="A balance instructor teaching on the reformer" fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          <div className="reveal lg:col-span-6 lg:col-start-7">
            <Eyebrow>{instructorTeaser.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-4xl leading-tight text-ink md:text-5xl">{instructorTeaser.title}</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">{instructorTeaser.body}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href="/instructors" className="btn btn-primary">Explore {instructorCourse.name}</Link>
              <ArrowLink href="/teaching-confidence-check">Take the teaching confidence check</ArrowLink>
            </div>
          </div>
        </Container>
      </section>

      <Faq items={studioFaqs} />

      <FinalCta
        title={studioFinalCta.title}
        body={studioFinalCta.body}
        image="/images/studio-bray-hero.jpg"
        primary={{ href: APPLY, label: "Apply for studio mentorship" }}
        secondary={{ href: "/studio-health-check", label: "Take the free health check" }}
      />
    </>
  );
}
