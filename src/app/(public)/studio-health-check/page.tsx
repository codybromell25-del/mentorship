import type { Metadata } from "next";
import Image from "next/image";
import { studioCheck } from "@/content/checks";
import { Container, Eyebrow } from "@/components/site/blocks";
import { SelfCheck } from "@/components/site/SelfCheck";

export const metadata: Metadata = {
  title: "Free Pilates studio health check",
  description:
    "Eight honest questions about how your Pilates studio is really running. Get a score, the two areas to focus on first, and a practical tip for each. Free, and nothing is stored.",
  alternates: { canonical: "/studio-health-check" },
};

export default function StudioHealthCheckPage() {
  return (
    <Container className="grid gap-14 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
      <aside className="lg:col-span-4">
        <Eyebrow>Free for studio owners</Eyebrow>
        <h1 className="mt-6 text-4xl leading-tight text-ink xl:text-5xl">The 2‑minute studio health check</h1>
        <p className="mt-6 leading-relaxed text-muted">
          Eight honest questions about how your studio is really running. You&apos;ll get a score, the two areas to
          focus on first, and a practical tip for each.
        </p>
        <div className="relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-[2rem] lg:block">
          <Image src="/images/why-balance-hallway.jpg" alt="" fill className="object-cover" sizes="30vw" />
        </div>
      </aside>
      <div className="rounded-[2rem] border border-border bg-background p-6 sm:p-10 lg:col-span-8">
        <SelfCheck
          config={studioCheck}
          primary={{ href: "/apply?track=studio", label: "Apply for studio mentorship" }}
          secondary={{ href: "/balancehq", label: "Or see your numbers with balanceHQ" }}
        />
      </div>
    </Container>
  );
}
