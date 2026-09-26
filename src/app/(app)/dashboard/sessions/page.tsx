import { redirect } from "next/navigation";
import { homeFor, requireUser } from "@/lib/session";
import { getMenteeEnrollment, nextMeeting } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/ui";
import { NextSessionCard } from "@/components/calls/NextSessionCard";
import { MeetingList } from "@/components/mentorship/MeetingList";

export const metadata = { title: "Video calls" };

export default async function MenteeSessions() {
  const user = await requireUser();
  if (user.role !== "MENTEE") redirect(homeFor(user.role));
  const enrollment = await getMenteeEnrollment(user.id);

  return (
    <>
      <PageHeader eyebrow="Video call centre" title="Your sessions" />
      {!enrollment ? (
        <EmptyState title="No sessions yet" />
      ) : (
        <div className="space-y-6">
          <NextSessionCard meeting={nextMeeting(enrollment.meetings)} withName={enrollment.mentor?.name} emptyText="No session booked yet." />
          <MeetingList meetings={enrollment.meetings} title="Schedule" />
        </div>
      )}
    </>
  );
}
