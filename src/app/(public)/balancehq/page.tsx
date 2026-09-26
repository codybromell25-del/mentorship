import type { Metadata } from "next";
import Image from "next/image";
import { software } from "@/lib/software";
import { hqFaqs, hqHero, hqQuestions, hqSteps } from "@/content/balancehq";
import { Container, Eyebrow, Faq, HeroTitle, SectionIntro, Steps } from "@/components/site/blocks";
import { EnquiryForm } from "./EnquiryForm";

export const metadata: Metadata = {
  title: "balanceHQ: software for Pilates studios",
  description:
    "The software that runs balance, now available to Pilates studios across Ireland: live studio reporting, instructor KPIs, time off and cover, and more. Sold separately from mentorship.",
  alternates: { canonical: "/balancehq" },
};

export default async function BalanceHQPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Container className="grid gap-14 pt-12 pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-28">
          <div className="lg:col-span-7 lg:pt-10">
            <Eyebrow>{hqHero.eyebrow}</Eyebrow>
            <div className="mt-8">
              <HeroTitle lineOne={hqHero.lineOne} lineTwo={hqHero.lineTwo} />
            </div>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">{hqHero.intro}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a href="#enquire" className="btn btn-accent">Enquire about balanceHQ</a>
              <p className="text-sm text-muted">Sold separately from mentorship</p>
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:aspect-auto lg:h-full lg:min-h-[560px]">
              <Image src="/images/studio-mirror.jpg" alt="The balance studio" fill priority className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Three questions ───────────────────────────────────────── */}
      <section className="bg-ink text-white">
        <Container className="py-24 md:py-32">
          <SectionIntro eyebrow="Be honest" title={hqQuestions.title} dark />
          <ol className="reveal mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-3">
            {hqQuestions.items.map((q, i) => (
              <li key={q} className="bg-ink p-8 md:p-10">
                <span className="font-heading text-sm text-gold italic">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-4 font-heading text-2xl leading-snug text-white/90 italic">{q}</p>
              </li>
            ))}
          </ol>
          <p className="reveal mt-14 text-xl text-white md:text-2xl">{hqQuestions.closing}</p>
        </Container>
      </section>

      {/* ─── Tools ─────────────────────────────────────────────────── */}
      <section>
        <Container className="py-24 md:py-32">
          <SectionIntro
            eyebrow="The tools"
            title="Built in a real studio, for real studios."
            intro="Start with one tool or take the lot. Everything is designed around how a Pilates studio actually runs."
          />
          <div className="reveal mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-border sm:grid-cols-2 lg:grid-cols-3">
            {software.map((t) => (
              <article key={t.key} className="flex flex-col bg-surface p-8 md:p-10">
                <p className={`text-[11px] tracking-[0.2em] uppercase ${t.status === "In use at balance" ? "text-accent" : "text-muted"}`}>{t.status}</p>
                <h3 className="mt-4 text-2xl text-ink">{t.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{t.body}</p>
                <a href={`?tool=${t.key}#enquire`} className="mt-6 text-sm text-ink underline decoration-border underline-offset-4 hover:decoration-ink">
                  Ask about {t.name.toLowerCase()}
                </a>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── How it works ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface">
        <Container className="py-24 md:py-28">
          <SectionIntro eyebrow="How it works" title="Set up once. Useful every week." />
          <div className="mt-16">
            <Steps steps={hqSteps} />
          </div>
        </Container>
      </section>

      {/* ─── Enquiry ───────────────────────────────────────────────── */}
      <section id="enquire" className="scroll-mt-20">
        <Container className="grid gap-14 py-24 md:py-32 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro
              eyebrow="Enquire"
              title="Get pricing and a demo."
              intro="Tell us about your studio and which tools you're interested in. We'll come back within a few days. You don't need to be on the mentorship programme."
            />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <EnquiryForm tools={software.map(({ key, name, status }) => ({ key, name, status }))} preselect={tool} />
          </div>
        </Container>
      </section>

      <Faq items={hqFaqs} />
    </>
  );
}
