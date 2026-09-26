import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { stripeConfigured } from "@/lib/stripe";
import { formatDate, formatMoney } from "@/lib/format";
import { SubmitButton } from "@/components/SubmitButton";
import { simulatePayment, startCheckout } from "../actions";

export const metadata = { title: "Confirm your place", robots: { index: false } };

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { paymentToken: token },
    include: { application: true, cohort: true },
  });
  if (!enrollment) notFound();

  if (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED") {
    return (
      <Centered title="You're already enrolled">
        <p>Your payment has been received. Check your email for the link to set up your account.</p>
        <Link href="/login" className="btn btn-primary mt-6">Sign in</Link>
      </Centered>
    );
  }
  if (enrollment.status === "CANCELLED") {
    return (
      <Centered title="This link is no longer active">
        <p>This place has been cancelled. If you think that&apos;s a mistake, reply to your acceptance email.</p>
      </Centered>
    );
  }

  const devMode = process.env.NODE_ENV !== "production" && !stripeConfigured();
  const paymentsOff = process.env.NODE_ENV === "production" && !stripeConfigured();

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <p className="eyebrow mb-3">Confirm your place</p>
      <h1 className="text-4xl text-ink">Welcome, {enrollment.application.name.split(" ")[0]}</h1>
      <p className="mt-4 text-muted">You&apos;ve been accepted. Complete payment to confirm your place.</p>

      <div className="card mt-8">
        <dl className="space-y-3 text-sm">
          <Row label="Cohort" value={enrollment.cohort.name} />
          <Row label="Dates" value={`${formatDate(enrollment.cohort.startDate)} – ${formatDate(enrollment.cohort.endDate)}`} />
          <div className="border-t border-border pt-3">
            <Row label="Total" value={<span className="font-heading text-2xl">{formatMoney(enrollment.amountCents, enrollment.currency)}</span>} />
          </div>
        </dl>

        {paymentsOff ? (
          <p className="mt-6 rounded-lg bg-surface-muted px-4 py-3 text-sm text-ink">
            Online payment isn&apos;t switched on yet. We&apos;ll be in touch shortly to confirm your place.
          </p>
        ) : devMode ? (
          <form action={simulatePayment.bind(null, token)} className="mt-6">
            <p className="mb-3 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
              Development mode: Stripe isn&apos;t configured, so this button marks the place as paid without charging.
            </p>
            <SubmitButton className="btn btn-accent w-full" pendingText="Processing…">Simulate payment</SubmitButton>
          </form>
        ) : (
          <form action={startCheckout.bind(null, token)} className="mt-6">
            <SubmitButton className="btn btn-accent w-full" pendingText="Redirecting to secure checkout…">
              Pay securely with Stripe
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

function Centered({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center text-muted">
      <h1 className="mb-4 text-3xl text-ink">{title}</h1>
      {children}
    </div>
  );
}
