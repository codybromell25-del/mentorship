"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { GoalStatus, MeetingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { appUrl } from "@/lib/site";
import { requireUser } from "@/lib/session";
import { fromDateTimeLocal } from "@/lib/format";
import { sendEmailAsync } from "@/lib/email";
import { meetingScheduledEmail } from "@/lib/emails";
import type { ActionState } from "@/components/ActionForm";

/**
 * Loads an enrollment and checks the signed-in user may act on it:
 * admins always; the mentor for mentor-only actions; mentor or mentee
 * for shared ones (goals).
 */
async function loadEnrollment(enrollmentId: string, who: "participant" | "mentor") {
  const user = await requireUser();
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { mentee: true, mentor: true },
  });
  if (!enrollment) throw new Error("Enrollment not found");

  const isAdmin = user.role === "ADMIN";
  const isMentor = enrollment.mentorId === user.id;
  const isMentee = enrollment.menteeId === user.id;
  const allowed = isAdmin || isMentor || (who === "participant" && isMentee);
  if (!allowed) throw new Error("Not allowed");

  return { user, enrollment };
}

function revalidateEnrollment(enrollmentId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/mentor");
  revalidatePath(`/mentor/mentees/${enrollmentId}`);
  revalidatePath(`/admin/enrollments/${enrollmentId}`);
}

// ─── Goals ──────────────────────────────────────────────────────────

const goalSchema = z.object({
  title: z.string().trim().min(3, "Give the goal a short title.").max(200),
  detail: z.string().trim().max(2000).optional(),
  dueDate: z.string().optional(),
});

export async function addGoal(enrollmentId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await loadEnrollment(enrollmentId, "participant");
  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    detail: formData.get("detail") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.goal.create({
    data: {
      enrollmentId,
      title: parsed.data.title,
      detail: parsed.data.detail || null,
      dueDate: parsed.data.dueDate ? new Date(`${parsed.data.dueDate}T12:00:00Z`) : null,
    },
  });
  revalidateEnrollment(enrollmentId);
  return { ok: "Goal added." };
}

async function loadGoal(goalId: string) {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new Error("Goal not found");
  await loadEnrollment(goal.enrollmentId, "participant");
  return goal;
}

export async function setGoalStatus(goalId: string, status: GoalStatus) {
  const goal = await loadGoal(goalId);
  await prisma.goal.update({ where: { id: goalId }, data: { status } });
  revalidateEnrollment(goal.enrollmentId);
}

export async function deleteGoal(goalId: string) {
  const goal = await loadGoal(goalId);
  await prisma.goal.delete({ where: { id: goalId } });
  revalidateEnrollment(goal.enrollmentId);
}

// ─── Meetings ───────────────────────────────────────────────────────

const meetingSchema = z.object({
  scheduledAt: z.string().min(1, "Pick a date and time."),
  durationMin: z.coerce.number().int().min(15).max(240),
  location: z.string().trim().max(500).optional(),
  agenda: z.string().trim().max(4000).optional(),
});

export async function scheduleMeeting(enrollmentId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, enrollment } = await loadEnrollment(enrollmentId, "mentor");
  if (enrollment.status !== "ACTIVE") return { error: "Sessions can only be booked for active enrollments." };

  const parsed = meetingSchema.safeParse({
    scheduledAt: formData.get("scheduledAt"),
    durationMin: formData.get("durationMin") || 45,
    location: formData.get("location") || undefined,
    agenda: formData.get("agenda") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const when = fromDateTimeLocal(parsed.data.scheduledAt);
  if (!when) return { error: "That date doesn't look right." };

  const meeting = await prisma.meeting.create({
    data: {
      enrollmentId,
      scheduledAt: when,
      durationMin: parsed.data.durationMin,
      location: parsed.data.location || null,
      agenda: parsed.data.agenda || null,
      createdById: user.id,
    },
  });

  if (enrollment.mentee) {
    sendEmailAsync({
      to: enrollment.mentee.email,
      ...meetingScheduledEmail({
        name: enrollment.mentee.name,
        otherName: enrollment.mentor?.name ?? "your mentor",
        when: meeting.scheduledAt,
        location: meeting.location,
        url: `${appUrl()}/dashboard`,
      }),
    });
  }

  revalidateEnrollment(enrollmentId);
  return { ok: "Session booked and your mentee has been emailed." };
}

const meetingUpdateSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]),
  notes: z.string().trim().max(10000).optional(),
  location: z.string().trim().max(500).optional(),
});

export async function updateMeeting(meetingId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return { error: "Session not found." };
  await loadEnrollment(meeting.enrollmentId, "mentor");

  const parsed = meetingUpdateSchema.safeParse({
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
    location: formData.get("location") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      status: parsed.data.status as MeetingStatus,
      notes: parsed.data.notes || null,
      location: parsed.data.location || null,
    },
  });
  revalidateEnrollment(meeting.enrollmentId);
  return { ok: "Saved." };
}
