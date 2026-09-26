"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { GoalStatus, MeetingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { appUrl, site } from "@/lib/site";
import { requireUser } from "@/lib/session";
import { formatDateTime, fromDateTimeLocal } from "@/lib/format";
import { cancelCalendarEvent, createCalendarEvent, updateCalendarEvent } from "@/lib/google";
import { sendEmailAsync } from "@/lib/email";
import { meetingCancelledEmail, meetingRescheduledEmail, meetingScheduledEmail } from "@/lib/emails";
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
  revalidatePath("/dashboard", "layout");
  revalidatePath("/mentor", "layout");
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

/** Another scheduled session for this mentor that overlaps [start, end). */
async function findClash(mentorId: string, start: Date, durationMin: number, ignoreId?: string) {
  const end = new Date(+start + durationMin * 60_000);
  const candidates = await prisma.meeting.findMany({
    where: {
      id: ignoreId ? { not: ignoreId } : undefined,
      status: "SCHEDULED",
      enrollment: { mentorId },
      scheduledAt: { lt: end, gte: new Date(+start - 4 * 3600_000) },
    },
    include: { enrollment: { include: { mentee: { select: { name: true } } } } },
  });
  return candidates.find((m) => +m.scheduledAt + m.durationMin * 60_000 > +start) ?? null;
}

/**
 * Books a session. `fixedEnrollmentId` is bound on a mentee's page; the
 * schedule page passes null and sends enrollmentId in the form instead.
 * With Google connected the event (and Meet link) is created on the
 * mentor's calendar and Google sends the invite; otherwise the mentor's
 * saved meeting link is used and we email the mentee ourselves.
 */
export async function scheduleMeeting(fixedEnrollmentId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const enrollmentId = fixedEnrollmentId ?? String(formData.get("enrollmentId") ?? "");
  if (!enrollmentId) return { error: "Choose who the session is with." };
  const { user, enrollment } = await loadEnrollment(enrollmentId, "mentor");
  if (enrollment.status !== "ACTIVE") return { error: "Sessions can only be booked for active enrollments." };
  const mentor = enrollment.mentor ?? (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }));

  const parsed = meetingSchema.safeParse({
    scheduledAt: formData.get("scheduledAt"),
    durationMin: formData.get("durationMin") || mentor.defaultDurationMin,
    location: formData.get("location") || undefined,
    agenda: formData.get("agenda") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const when = fromDateTimeLocal(parsed.data.scheduledAt);
  if (!when) return { error: "That date doesn't look right." };
  if (+when < Date.now() - 5 * 60_000) return { error: "That time is in the past." };

  const clash = await findClash(mentor.id, when, parsed.data.durationMin);
  if (clash) {
    return { error: `That overlaps your session with ${clash.enrollment.mentee?.name ?? "another mentee"} at ${formatDateTime(clash.scheduledAt)}.` };
  }

  // Link priority: typed in the form → new Google Meet → mentor's saved room.
  let location = parsed.data.location || null;
  let googleEventId: string | null = null;
  let warning = "";
  try {
    const event = await createCalendarEvent(mentor.id, {
      title: `${site.name}: ${enrollment.mentee?.name ?? "Mentee"} & ${mentor.name}`,
      description: [parsed.data.agenda, `Dashboard: ${appUrl()}/dashboard`].filter(Boolean).join("\n\n"),
      start: when,
      durationMin: parsed.data.durationMin,
      attendeeEmail: enrollment.mentee?.email,
    });
    if (event) {
      googleEventId = event.eventId;
      location = location ?? event.meetUrl;
    }
  } catch (e) {
    console.error("[google] create event failed:", e);
    warning = " Google Calendar couldn't be updated, so check the connection in Settings.";
  }
  location = location ?? mentor.meetingLink ?? null;

  const meeting = await prisma.meeting.create({
    data: {
      enrollmentId,
      scheduledAt: when,
      durationMin: parsed.data.durationMin,
      location,
      googleEventId,
      agenda: parsed.data.agenda || null,
      createdById: user.id,
    },
  });

  if (enrollment.mentee && !googleEventId) {
    sendEmailAsync({
      to: enrollment.mentee.email,
      ...meetingScheduledEmail({
        name: enrollment.mentee.name,
        otherName: mentor.name,
        when: meeting.scheduledAt,
        location: meeting.location,
        url: `${appUrl()}/dashboard/sessions`,
      }),
    });
  }

  revalidateEnrollment(enrollmentId);
  const how = googleEventId ? "added to Google Calendar with a Meet link — your mentee has been invited" : "booked and your mentee has been emailed";
  const noLink = location ? "" : " There's no video link yet: add one to the session or save your Meet link in Settings.";
  return { ok: `Session ${how}.${noLink}${warning}` };
}

const meetingUpdateSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]),
  scheduledAt: z.string().optional(),
  durationMin: z.coerce.number().int().min(15).max(240).optional(),
  notes: z.string().trim().max(10000).optional(),
  location: z.string().trim().max(500).optional(),
});

/** Reschedule, cancel, complete, or add notes. Keeps Google and the mentee in sync. */
export async function updateMeeting(meetingId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return { error: "Session not found." };
  const { enrollment } = await loadEnrollment(meeting.enrollmentId, "mentor");

  const parsed = meetingUpdateSchema.safeParse({
    status: formData.get("status") ?? meeting.status,
    scheduledAt: formData.get("scheduledAt") || undefined,
    durationMin: formData.get("durationMin") || undefined,
    notes: formData.has("notes") ? String(formData.get("notes")) : undefined,
    location: formData.has("location") ? String(formData.get("location")) : undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const when = d.scheduledAt ? fromDateTimeLocal(d.scheduledAt) : meeting.scheduledAt;
  if (!when) return { error: "That date doesn't look right." };
  const durationMin = d.durationMin ?? meeting.durationMin;
  const moved = +when !== +meeting.scheduledAt || durationMin !== meeting.durationMin;
  const cancelling = d.status === "CANCELLED" && meeting.status !== "CANCELLED";

  if (moved && d.status === "SCHEDULED" && enrollment.mentorId) {
    const clash = await findClash(enrollment.mentorId, when, durationMin, meeting.id);
    if (clash) return { error: `That overlaps your session at ${formatDateTime(clash.scheduledAt)}.` };
  }

  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      status: d.status as MeetingStatus,
      scheduledAt: when,
      durationMin,
      notes: d.notes === undefined ? undefined : d.notes || null,
      location: d.location === undefined ? undefined : d.location || null,
    },
  });

  let warning = "";
  if (meeting.googleEventId && enrollment.mentorId && (cancelling || (moved && d.status === "SCHEDULED"))) {
    try {
      if (cancelling) await cancelCalendarEvent(enrollment.mentorId, meeting.googleEventId);
      else await updateCalendarEvent(enrollment.mentorId, meeting.googleEventId, { start: when, durationMin });
    } catch (e) {
      console.error("[google] sync failed:", e);
      warning = " Google Calendar couldn't be updated, so change it there too.";
    }
  }

  // Google emails the mentee itself for calendar-backed sessions.
  if (enrollment.mentee && !meeting.googleEventId && (cancelling || (moved && d.status === "SCHEDULED"))) {
    const mail = cancelling
      ? meetingCancelledEmail({ name: enrollment.mentee.name, otherName: enrollment.mentor?.name ?? "your mentor", when: meeting.scheduledAt })
      : meetingRescheduledEmail({
          name: enrollment.mentee.name,
          otherName: enrollment.mentor?.name ?? "your mentor",
          when,
          location: d.location ?? meeting.location,
          url: `${appUrl()}/dashboard/sessions`,
        });
    sendEmailAsync({ to: enrollment.mentee.email, ...mail });
  }

  revalidateEnrollment(meeting.enrollmentId);
  if (cancelling) return { ok: `Session cancelled and your mentee has been told.${warning}` };
  if (moved) return { ok: `Session moved to ${formatDateTime(when)}; your mentee has been told.${warning}` };
  return { ok: `Saved.${warning}` };
}

// ─── Mentor settings ────────────────────────────────────────────────

const settingsSchema = z.object({
  meetingLink: z.union([z.literal(""), z.url({ protocol: /^https$/, error: "Use a full https:// link, e.g. https://meet.google.com/abc-defg-hij" })]),
  defaultDurationMin: z.coerce.number().int().min(15).max(240),
  headline: z.string().trim().max(200),
  bio: z.string().trim().max(3000),
});

export async function saveMentorSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["MENTOR", "ADMIN"]);
  const parsed = settingsSchema.safeParse({
    meetingLink: String(formData.get("meetingLink") ?? "").trim(),
    defaultDurationMin: formData.get("defaultDurationMin") || 45,
    headline: formData.get("headline") ?? "",
    bio: formData.get("bio") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await prisma.user.update({
    where: { id: user.id },
    data: { meetingLink: d.meetingLink || null, defaultDurationMin: d.defaultDurationMin, headline: d.headline || null, bio: d.bio || null },
  });
  revalidatePath("/mentor", "layout");
  return { ok: "Settings saved." };
}

export async function disconnectGoogle() {
  const user = await requireUser(["MENTOR", "ADMIN"]);
  await prisma.googleAccount.deleteMany({ where: { userId: user.id } });
  revalidatePath("/mentor/settings");
}
