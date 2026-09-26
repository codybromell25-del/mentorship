import { prisma } from "@/lib/db";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { activateEnrollment } from "@/lib/enrollment";

export const metadata = { title: "Payment received", robots: { index: false } };

export default async function PaySuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  // The webhook is the source of truth, but it can lag a few seconds
  // behind the redirect. Activating here too (idempotently) means the
  // setup email goes out even if the webhook is slow or misconfigured.
  if (session_id && stripeConfigured()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      const enrollmentId = session.metadata?.enrollmentId;
      if (session.payment_status === "paid" && enrollmentId) {
        const exists = await prisma.enrollment.findUnique({ where: { id: enrollmentId }, select: { id: true } });
        if (exists) await activateEnrollment(enrollmentId, session.id);
      }
    } catch (e) {
      console.error("[pay/success] could not verify session:", e);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="eyebrow mb-3">Payment received</p>
      <h1 className="text-4xl text-ink">You&apos;re in!</h1>
      <p className="mt-4 leading-relaxed text-muted">
        We&apos;ve emailed you a link to set your password. Once you&apos;re in, you&apos;ll see your mentor, sessions and goals.
      </p>
    </div>
  );
}
