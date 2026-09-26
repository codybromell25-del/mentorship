import { prisma } from "@/lib/db";
import { nextMeeting } from "@/lib/queries";

/** A mentor's active/completed mentees with their sessions and goals. */
export function getMentorEnrollments(mentorId: string) {
  return prisma.enrollment.findMany({
    where: { mentorId, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: [{ status: "asc" }, { paidAt: "desc" }],
    include: {
      mentee: { select: { name: true, email: true } },
      cohort: { select: { name: true, track: true } },
      goals: { select: { status: true } },
      meetings: true,
    },
  });
}

export type MentorEnrollment = Awaited<ReturnType<typeof getMentorEnrollments>>[number];

export function flattenMeetings(enrollments: MentorEnrollment[]) {
  return enrollments.flatMap((e) =>
    e.meetings.map((m) => ({ ...m, withName: e.mentee?.name ?? "Mentee", href: `/mentor/mentees/${e.id}` })),
  );
}

/** Headline numbers for the mentor overview. */
export function mentorStats(enrollments: MentorEnrollment[]) {
  const meetings = flattenMeetings(enrollments);
  const now = Date.now();
  const active = enrollments.filter((e) => e.status === "ACTIVE");
  return {
    active: active.length,
    weekAhead: meetings.filter((m) => m.status === "SCHEDULED" && +m.scheduledAt > now && +m.scheduledAt < now + 7 * 86_400_000).length,
    needBooking: active.filter((e) => !nextMeeting(e.meetings)).length,
    notesToWrite: meetings.filter((m) => +m.scheduledAt < now && m.status !== "CANCELLED" && !m.notes).length,
  };
}
