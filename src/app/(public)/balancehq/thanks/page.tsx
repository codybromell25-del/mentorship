import Link from "next/link";

export const metadata = { title: "Enquiry received" };

export default function EnquiryThanks() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="eyebrow mb-3">Enquiry received</p>
      <h1 className="text-4xl text-ink">Thanks, we&apos;ll be in touch</h1>
      <p className="mt-4 leading-relaxed text-muted">We&apos;ll email you within a few days with pricing and a time for a demo.</p>
      <Link href="/" className="btn btn-ghost mt-8">Back to home</Link>
    </div>
  );
}
