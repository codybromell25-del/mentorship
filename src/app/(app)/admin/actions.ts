"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { appUrl } from "@/lib/site";
import { requireUser } from "@/lib/session";
import { randomToken, issueAuthToken } from "@/lib/tokens";
import { sendEmailAsync } from "@/lib/email";
import { acceptedEmail, accountSetupEmail, mentorAssignedEmail, rejectedEmail, waitlistedEmail } from "@/lib/emails";
import type { ActionState } from "@/components/ActionForm";
import { emailEnabled } from "@/lib/config";

/**
 * Confirmation text for actions that email someone a link. Until email is
 * switched on, the admin gets the link to pass on themselves instead.
 */
const linkSent = (done: string, emailed: string, url: string) =>
  emailEnabled() ? `${done} — ${emailed}.` : `${done}. Email isn't switched on yet, so send them this link yourself: ${url}`;

const requireAdmin = () => requireUser(["ADMIN"]);

// ─── Applications ───────────────────────────────────────────────────

/** Places taken = paid or awaiting payment. */
async function placesTaken(cohortId: string) {
  return prisma.enrollment.count({ where: { cohortId, status: { in: ["AWAITING_PAYMENT", "ACTIVE", "COMPLETED"] } } });
}

export async function acceptApplication(applicationId: string): Promise<ActionState> {
  await requireAdmin();
  const app = await prisma.application.findUnique({ where: { id: applicationId }, include: { cohort: true, enrollment: true } });
  if (!app) return { error: "Application not found." };
  if (app.enrollment) return { error: "Already accepted." };
  if ((await placesTaken(app.cohortId)) >= app.cohort.capacity) {
    return { error: `${app.cohort.name} is full (${app.cohort.capacity} places). Waitlist instead, or raise capacity.` };
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    await tx.application.update({ where: { id: app.id }, data: { status: "ACCEPTED", reviewedAt: new Date() } });
    return tx.enrollment.create({
      data: {
        applicationId: app.id,
        cohortId: app.cohortId,
        paymentToken: randomToken(),
        amountCents: app.cohort.priceCents,
        currency: app.cohort.currency,
      },
    });
  });

  const payUrl = `${appUrl()}/pay/${enrollment.paymentToken}`;
  sendEmailAsync({
    to: app.email,
    ...acceptedEmail({
      name: app.name,
      cohortName: app.cohort.name,
      amountCents: enrollment.amountCents,
      currency: enrollment.currency,
      payUrl,
    }),
  });
  revalidatePath("/admin", "layout");
  return { ok: linkSent("Accepted", `payment link emailed to ${app.email}`, payUrl) };
}

export async function decideApplication(applicationId: string, status: "WAITLISTED" | "REJECTED"): Promise<ActionState> {
  await requireAdmin();
  const app = await prisma.application.findUnique({ where: { id: applicationId }, include: { cohort: true, enrollment: true } });
  if (!app) return { error: "Application not found." };
  if (app.enrollment && app.enrollment.status !== "CANCELLED") return { error: "Cancel the enrollment first." };

  await prisma.application.update({ where: { id: app.id }, data: { status, reviewedAt: new Date() } });
  const mail = status === "REJECTED" ? rejectedEmail : waitlistedEmail;
  sendEmailAsync({ to: app.email, ...mail({ name: app.name, cohortName: app.cohort.name }) });
  revalidatePath("/admin", "layout");
  return { ok: status === "REJECTED" ? "Declined and emailed." : "Waitlisted and emailed." };
}

export async function saveApplicationNotes(applicationId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const notes = String(formData.get("adminNotes") ?? "").trim().slice(0, 4000);
  await prisma.application.update({ where: { id: applicationId }, data: { adminNotes: notes || null } });
  revalidatePath("/admin/applications");
  return { ok: "Notes saved." };
}

export async function resendPaymentLink(enrollmentId: string): Promise<ActionState> {
  await requireAdmin();
  const e = await prisma.enrollment.findUnique({ where: { id: enrollmentId }, include: { application: true, cohort: true } });
  if (!e || e.status !== "AWAITING_PAYMENT") return { error: "No payment is pending for this enrollment." };
  const payUrl = `${appUrl()}/pay/${e.paymentToken}`;
  sendEmailAsync({
    to: e.application.email,
    ...acceptedEmail({
      name: e.application.name,
      cohortName: e.cohort.name,
      amountCents: e.amountCents,
      currency: e.currency,
      payUrl,
    }),
  });
  return { ok: linkSent("Done", "payment link re-sent", payUrl) };
}

// ─── Enrollments ────────────────────────────────────────────────────

export async function assignMentor(enrollmentId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const mentorId = String(formData.get("mentorId") ?? "") || null;
  const e = await prisma.enrollment.findUnique({ where: { id: enrollmentId }, include: { mentee: true } });
  if (!e) return { error: "Enrollment not found." };

  let mentorName: string | null = null;
  if (mentorId) {
    const mentor = await prisma.user.findFirst({ where: { id: mentorId, role: { in: ["MENTOR", "ADMIN"] } } });
    if (!mentor) return { error: "That mentor doesn't exist." };
    mentorName = mentor.name;
  }

  await prisma.enrollment.update({ where: { id: enrollmentId }, data: { mentorId } });

  if (mentorName && e.mentee && mentorId !== e.mentorId) {
    sendEmailAsync({
      to: e.mentee.email,
      ...mentorAssignedEmail({ menteeName: e.mentee.name, mentorName, url: `${appUrl()}/dashboard` }),
    });
  }
  revalidatePath("/admin", "layout");
  return { ok: mentorName ? `Assigned to ${mentorName}.` : "Mentor removed." };
}

export async function setEnrollmentStatus(enrollmentId: string, status: "COMPLETED" | "CANCELLED" | "ACTIVE"): Promise<ActionState> {
  await requireAdmin();
  const e = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!e) return { error: "Enrollment not found." };
  if (status === "ACTIVE" && !e.paidAt) return { error: "Unpaid enrollments can't be reactivated; resend the payment link instead." };
  await prisma.enrollment.update({ where: { id: enrollmentId }, data: { status } });
  revalidatePath("/admin", "layout");
  return { ok: "Updated." };
}

// ─── Cohorts ────────────────────────────────────────────────────────

const cohortSchema = z
  .object({
    name: z.string().trim().min(2, "Name the intake.").max(120),
    track: z.enum(["STUDIO", "INSTRUCTOR"]),
    description: z.string().trim().max(1000).optional(),
    startDate: z.iso.date("Pick a start date."),
    endDate: z.iso.date("Pick an end date."),
    price: z.coerce.number().positive("Price must be more than 0."),
    currency: z.enum(["eur", "gbp", "usd"]),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1."),
  })
  .refine((d) => d.endDate > d.startDate, { message: "End date must be after start date." });

export async function createCohort(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = cohortSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await prisma.cohort.create({
    data: {
      name: d.name,
      track: d.track,
      description: d.description || null,
      startDate: new Date(`${d.startDate}T09:00:00Z`),
      endDate: new Date(`${d.endDate}T17:00:00Z`),
      priceCents: Math.round(d.price * 100),
      currency: d.currency,
      capacity: d.capacity,
    },
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  return { ok: `${d.name} created.` };
}

export async function toggleCohortOpen(cohortId: string) {
  await requireAdmin();
  const c = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!c) return;
  await prisma.cohort.update({ where: { id: cohortId }, data: { isOpen: !c.isOpen } });
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}

// ─── Mentors ────────────────────────────────────────────────────────

const mentorSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(120),
  email: z.email("Enter a valid email.").trim().toLowerCase(),
  headline: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(3000).optional(),
});

export async function createMentor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = mentorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  if (await prisma.user.findUnique({ where: { email: d.email } })) {
    return { error: "Someone with that email already has an account." };
  }
  const user = await prisma.user.create({
    data: { name: d.name, email: d.email, headline: d.headline || null, bio: d.bio || null, role: "MENTOR" },
  });
  const token = await issueAuthToken(user.id, "ACCOUNT_SETUP");
  const setupUrl = `${appUrl()}/set-password/${token}`;
  sendEmailAsync({ to: user.email, ...accountSetupEmail({ name: user.name, url: setupUrl, isMentor: true }) });

  revalidatePath("/admin/mentors");
  return { ok: linkSent(`${d.name} added`, "setup email sent", setupUrl) };
}

export async function updateMentorProfile(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const headline = String(formData.get("headline") ?? "").trim().slice(0, 200);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 3000);
  await prisma.user.update({ where: { id: userId }, data: { headline: headline || null, bio: bio || null } });
  revalidatePath("/admin/mentors");
  return { ok: "Profile saved." };
}

// ─── balanceHQ enquiries ────────────────────────────────────────────

export async function toggleEnquiryHandled(enquiryId: string) {
  await requireAdmin();
  const e = await prisma.softwareEnquiry.findUnique({ where: { id: enquiryId } });
  if (!e) return;
  await prisma.softwareEnquiry.update({ where: { id: enquiryId }, data: { handled: !e.handled } });
  revalidatePath("/admin", "layout");
}
