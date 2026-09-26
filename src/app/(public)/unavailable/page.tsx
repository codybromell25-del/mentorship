import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Container, Eyebrow } from "@/components/site/blocks";

export const metadata: Metadata = { title: "Coming soon", robots: { index: false } };

/** Shown (via the proxy) for sign-in pages while accounts aren't switched on. */
export default function UnavailablePage() {
  return (
    <Container className="py-24 md:py-32">
      <div className="mx-auto max-w-xl text-center">
        <div className="flex justify-center">
          <Eyebrow>Sign in</Eyebrow>
        </div>
        <h1 className="mt-6 text-4xl text-ink md:text-5xl">Accounts are opening soon</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Mentee and mentor dashboards aren&apos;t switched on yet. If you&apos;re expecting access, email{" "}
          <a href={`mailto:${site.contactEmail}`} className="text-ink underline">{site.contactEmail}</a>.
        </p>
        <Link href="/" className="btn btn-ghost mt-10">Back to the homepage</Link>
      </div>
    </Container>
  );
}
