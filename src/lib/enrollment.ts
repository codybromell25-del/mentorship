import { prisma } from "@/lib/db";
import { appUrl } from "@/lib/site";
import { issueAuthToken } from "@/lib/tokens";
import { notifyAdmin, sendEmailAsync } from "@/lib/email";
import { accountSetupEmail, adminPaymentEmail } from "@/lib/emails";

/**
 * Marks an enrollment paid, creates (or links) the mentee's account and
 * sends the account-setup email. Idempotent: Stripe retries webhooks, so
 * a second call for an already-active enrollment is a no-op.
 */
export async function activateEnrollment(enrollmentId: string, stripeSessionId: string | null) {
  const result = await prisma.$transaction(async (tx) => {
    // Conditional update first: it takes the row lock, so if the webhook
    // and the success page race, the second one sees count === 0.
    const claimed = await tx.enrollment.updateMany({
      where: { id: enrollmentId, status: "AWAITING_PAYMENT" },
      data: { status: "ACTIVE", paidAt: new Date(), stripeSessionId },
    });
    if (claimed.count === 0) return null;

    const enrollment = await tx.enrollment.findUniqueOrThrow({
      where: { id: enrollmentId },
      include: { application: true, cohort: true },
    });
    const email = enrollment.application.email.toLowerCase();
    const user = await tx.user.upsert({
      where: { email },
      update: {},
      create: { name: enrollment.application.name, email, role: "MENTEE" },
    });
    await tx.enrollment.update({ where: { id: enrollmentId }, data: { menteeId: user.id } });
    return { enrollment, user };
  });
  if (!result) return;

  const { enrollment, user } = result;

  if (!user.passwordHash) {
    const token = await issueAuthToken(user.id, "ACCOUNT_SETUP");
    const mail = accountSetupEmail({ name: user.name, url: `${appUrl()}/set-password/${token}`, isMentor: false });
    sendEmailAsync({ to: user.email, ...mail });
  }

  notifyAdmin(
    adminPaymentEmail({
      name: user.name,
      email: user.email,
      cohortName: enrollment.cohort.name,
      amountCents: enrollment.amountCents,
      currency: enrollment.currency,
    }),
  );
}
