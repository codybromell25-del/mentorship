import type { Metadata } from "next";
import Image from "next/image";
import { teachingCheck } from "@/content/checks";
import { instructorCourse } from "@/content/instructors";
import { Container, Eyebrow } from "@/components/site/blocks";
import { SelfCheck } from "@/components/site/SelfCheck";

export const metadata: Metadata = {
  title: "Free teaching confidence check for Pilates instructors",
  description:
    "Eight quick questions about how teaching feels right now. See where you're strong, where you're hardest on yourself, and one thing to try in your next class. Free, and nothing is stored.",
  alternates: { canonical: "/teaching-confidence-check" },
};

export default function TeachingConfidenceCheckPage() {
  return (
    <Container className="grid gap-14 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
      <aside className="lg:col-span-4">
        <Eyebrow>Free for instructors</Eyebrow>
        <h1 className="mt-6 text-4xl leading-tight text-ink xl:text-5xl">The teaching confidence check</h1>
        <p className="mt-6 leading-relaxed text-muted">
          Eight quick questions about how teaching feels right now. See where you&apos;re strong, where you&apos;re
          being hardest on yourself, and what to try in your next class.
        </p>
        <div className="relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-[2rem] lg:block">
          <Image src="/images/balance-09.jpg" alt="" fill className="object-cover" sizes="30vw" />
        </div>
      </aside>
      <div className="rounded-[2rem] border border-border bg-background p-6 sm:p-10 lg:col-span-8">
        <SelfCheck
          config={teachingCheck}
          primary={{ href: "/apply?track=instructor", label: `Apply for ${instructorCourse.name}` }}
          secondary={{ href: "/instructors", label: `Learn about ${instructorCourse.name}` }}
        />
      </div>
    </Container>
  );
}
