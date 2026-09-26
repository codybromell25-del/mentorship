/**
 * Every email the app sends. Each returns { subject, html, text }.
 */
import { site } from "@/lib/site";
import { formatDateTime, formatMoney } from "@/lib/format";
import { renderEmail } from "@/lib/emails/layout";
import { softwareName } from "@/lib/software";

type Email = { subject: string; html: string; text: string };

function build(subject: string, heading: string, paragraphs: string[], cta?: { label: string; url: string }, footer?: string): Email {
  const text = [...paragraphs, ...(cta ? [`${cta.label}: ${cta.url}`] : []), ...(footer ? ["", footer] : [])].join("\n\n");
  return { subject, html: renderEmail({ heading, paragraphs, cta, footer }), text };
}

export function applicationReceivedEmail(a: { name: string; cohortName: string }): Email {
  return build(
    `We've received your application — ${site.name}`,
    "Thanks for applying",
    [
      `Hi ${a.name},`,
      `Your application for the ${a.cohortName} cohort is in. We read every application personally and will get back to you within a week.`,
    ],
  );
}

export function adminNewApplicationEmail(a: { name: string; email: string; cohortName: string; url: string }): Email {
  return build(
    `New application: ${a.name}`,
    "New application",
    [`${a.name} (${a.email}) applied for ${a.cohortName}.`],
    { label: "Review applications", url: a.url },
  );
}

export function acceptedEmail(a: { name: string; cohortName: string; amountCents: number; currency: string; payUrl: string }): Email {
  return build(
    `You're in — confirm your place in ${site.name}`,
    "Your application was accepted",
    [
      `Hi ${a.name},`,
      `Great news: we'd love to have you in the ${a.cohortName} cohort.`,
      `To confirm your place, complete payment of ${formatMoney(a.amountCents, a.currency)} using the link below. Once paid, you'll get an email to set up your account and meet your mentor.`,
    ],
    { label: "Confirm my place", url: a.payUrl },
  );
}

export function rejectedEmail(a: { name: string; cohortName: string }): Email {
  return build(
    `Your ${site.name} application`,
    "Thank you for applying",
    [
      `Hi ${a.name},`,
      `Thank you for applying to the ${a.cohortName} cohort. We had more strong applicants than places, and unfortunately we can't offer you a place this time.`,
      `We'd genuinely welcome an application for a future cohort.`,
    ],
  );
}

export function waitlistedEmail(a: { name: string; cohortName: string }): Email {
  return build(
    `You're on the waitlist — ${site.name}`,
    "You're on the waitlist",
    [
      `Hi ${a.name},`,
      `The ${a.cohortName} cohort is currently full, but we've placed you on the waitlist. If a place opens up, we'll email you straight away.`,
    ],
  );
}

export function accountSetupEmail(a: { name: string; url: string; isMentor: boolean }): Email {
  return build(
    `Set up your ${site.name} account`,
    a.isMentor ? "Welcome aboard, mentor" : "You're enrolled — welcome!",
    [
      `Hi ${a.name},`,
      a.isMentor
        ? `You've been added as a mentor. Choose a password to access your mentee dashboard.`
        : `Your payment went through and your place is confirmed. Choose a password to access your dashboard, where you'll see your mentor, sessions and goals.`,
    ],
    { label: "Set my password", url: a.url },
    "This link expires in 7 days.",
  );
}

export function passwordResetEmail(a: { name: string; url: string }): Email {
  return build(
    `Reset your ${site.name} password`,
    "Reset your password",
    [`Hi ${a.name},`, `Use the link below to choose a new password.`],
    { label: "Reset password", url: a.url },
    "This link expires in 2 hours. If you didn't ask for this, you can ignore this email.",
  );
}

export function adminPaymentEmail(a: { name: string; email: string; cohortName: string; amountCents: number; currency: string }): Email {
  return build(
    `Payment received: ${a.name}`,
    "Payment received",
    [`${a.name} (${a.email}) paid ${formatMoney(a.amountCents, a.currency)} for ${a.cohortName}. Remember to assign a mentor.`],
  );
}

export function mentorAssignedEmail(a: { menteeName: string; mentorName: string; url: string }): Email {
  return build(
    `Meet your mentor, ${a.mentorName}`,
    "You've been matched",
    [`Hi ${a.menteeName},`, `${a.mentorName} will be your mentor. They'll be in touch to book your first session.`],
    { label: "Open dashboard", url: a.url },
  );
}

export function meetingScheduledEmail(a: { name: string; otherName: string; when: Date; location?: string | null; url: string }): Email {
  return build(
    `Session booked: ${formatDateTime(a.when)}`,
    "New session booked",
    [
      `Hi ${a.name},`,
      `A session with ${a.otherName} is booked for ${formatDateTime(a.when)} (${site.timeZone}).`,
      ...(a.location ? [`Where: ${a.location}`] : []),
    ],
    { label: "View session", url: a.url },
  );
}

export function meetingRescheduledEmail(a: { name: string; otherName: string; when: Date; location?: string | null; url: string }): Email {
  return build(
    `Session moved: ${formatDateTime(a.when)}`,
    "Your session has moved",
    [
      `Hi ${a.name},`,
      `Your session with ${a.otherName} is now on ${formatDateTime(a.when)} (${site.timeZone}).`,
      ...(a.location ? [`Where: ${a.location}`] : []),
    ],
    { label: "View session", url: a.url },
  );
}

export function meetingCancelledEmail(a: { name: string; otherName: string; when: Date }): Email {
  return build(`Session cancelled: ${formatDateTime(a.when)}`, "Session cancelled", [
    `Hi ${a.name},`,
    `Your session with ${a.otherName} on ${formatDateTime(a.when)} has been cancelled. They'll be in touch to find a new time.`,
  ]);
}

export function softwareEnquiryReceivedEmail(a: { name: string }): Email {
  return build("Thanks for your balanceHQ enquiry", "We've got your enquiry", [
    `Hi ${a.name},`,
    "Thanks for your interest in balanceHQ. We'll be in touch within a few days with pricing and a time for a demo.",
  ]);
}

export function adminSoftwareEnquiryEmail(a: { name: string; email: string; studioName: string; tools: string[]; url: string }): Email {
  return build(
    `balanceHQ enquiry: ${a.studioName}`,
    "New balanceHQ enquiry",
    [`${a.name} (${a.email}) from ${a.studioName} is interested in: ${a.tools.map(softwareName).join(", ")}.`],
    { label: "View enquiries", url: a.url },
  );
}
