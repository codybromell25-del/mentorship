import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { nextMeeting } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { NextSessionCard } from "@/components/calls/NextSessionCard";
import { MeetingList } from "@/components/mentorship/MeetingList";
import { ScheduleMeetingForm } from "@/components/mentorship/ScheduleMeetingForm";
import { flattenMeetings, getMentorEnrollments } from "../data";

export const metadata = { title: "Schedule & calls" };

export default async function MentorSchedule() {
  const user = await requireUser(["MENTOR", "ADMIN"]);
  const [enrollments, me, google] = await Promise.all([
    getMentorEnrollments(user.id),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { defaultDurationMin: true } }),
    prisma.googleAccount.findUnique({ where: { userId: user.id }, select: { id: true } }),
  ]);
  const meetings = flattenMeetings(enrollments);
  const next = nextMeeting(meetings);
  const active = enrollments.filter((e) => e.status === "ACTIVE");

  return (
    <>
      <PageHeader eyebrow="Video call centre" title="Schedule & calls" />
      <div className="space-y-6">
        <NextSessionCard meeting={next} withName={next?.withName} emptyText="Nothing booked yet." />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <MeetingList meetings={meetings} canManage title="Upcoming sessions" />
          <div className="lg:sticky lg:top-24 lg:self-start">
            {active.length > 0 ? (
              <ScheduleMeetingForm
                mentees={active.map((e) => ({ enrollmentId: e.id, name: e.mentee?.name ?? "Mentee" }))}
                defaultDurationMin={me.defaultDurationMin}
                googleConnected={!!google}
              />
            ) : (
              <div className="card text-sm text-muted">You&apos;ll be able to book sessions once you have active mentees.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
