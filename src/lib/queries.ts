import { prisma } from "@/lib/db";

/** The mentee's current (or most recent) enrollment with everything the dashboard shows. */
export function getMenteeEnrollment(userId: string) {
  return prisma.enrollment.findFirst({
    where: { menteeId: userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: [{ status: "asc" }, { paidAt: "desc" }],
    include: {
      cohort: true,
      mentor: { select: { name: true, email: true, headline: true, bio: true } },
      meetings: true,
      goals: { orderBy: { createdAt: "asc" } },
    },
  });
}

/** Next scheduled session that hasn't finished yet. */
export function nextMeeting<T extends { status: string; scheduledAt: Date; durationMin: number }>(meetings: T[]): T | null {
  const now = Date.now();
  return (
    meetings
      .filter((m) => m.status === "SCHEDULED" && +m.scheduledAt + m.durationMin * 60_000 > now)
      .sort((a, b) => +a.scheduledAt - +b.scheduledAt)[0] ?? null
  );
}
