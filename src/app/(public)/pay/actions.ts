"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { appUrl, site } from "@/lib/site";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { activateEnrollment } from "@/lib/enrollment";

async function findPayable(token: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { paymentToken: token },
    include: { application: true, cohort: true },
  });
  if (!enrollment || enrollment.status !== "AWAITING_PAYMENT") redirect(`/pay/${token}`);
  return enrollment;
}

export async function startCheckout(token: string) {
  const enrollment = await findPayable(token);
  const base = appUrl();

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: enrollment.application.email,
    client_reference_id: enrollment.id,
    metadata: { enrollmentId: enrollment.id },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: enrollment.currency,
          unit_amount: enrollment.amountCents,
          product_data: { name: `${site.name} — ${enrollment.cohort.name}` },
        },
      },
    ],
    success_url: `${base}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/pay/${token}`,
  });

  redirect(session.url!);
}

/** Local development only: skips Stripe so the full flow can be tested. */
export async function simulatePayment(token: string) {
  if (process.env.NODE_ENV === "production" || stripeConfigured()) {
    throw new Error("Payment simulation is only available in development without Stripe keys.");
  }
  const enrollment = await findPayable(token);
  await activateEnrollment(enrollment.id, null);
  redirect("/pay/success");
}
