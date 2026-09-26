import Link from "next/link";

export const metadata = { title: "Application received" };

export default function ThanksPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="eyebrow mb-3">Application received</p>
      <h1 className="text-4xl text-ink">Thank you for applying</h1>
      <p className="mt-4 leading-relaxed text-muted">
        We&apos;ve emailed you a confirmation. We&apos;ll review your application and get back to you within a week.
      </p>
      <Link href="/" className="btn btn-ghost mt-8">Back to home</Link>
    </div>
  );
}
