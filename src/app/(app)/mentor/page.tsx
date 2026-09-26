import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatDateTime } from "@/lib/format";
import { nextMeeting } from "@/lib/queries";
import { EmptyState, Stat, StatusBadge } from "@/components/ui";
import { DashboardHeader } from "@/components/DashboardHeader";
import { NextSessionCard } from "@/components/calls/NextSessionCard";
import { flattenMeetings, getMentorEnrollments, mentorStats } from "./data";

export const metadata = { title: "Mentor" };

export default async function MentorHome() {
  const user = await requireUser(["MENTOR", "ADMIN"]);
  const [enrollments, google] = await Promise.all([
    getMentorEnrollments(user.id),
    prisma.googleAccount.findUnique({ where: { userId: user.id }, select: { googleEmail: true } }),
  ]);

  const meetings = flattenMeetings(enrollments);
  const next = nextMeeting(meetings);
  const stats = mentorStats(enrollments);

  return (
    <>
      <DashboardHeader eyebrow="Mentor" name={user.name} subtitle={google ? `Google Calendar connected (${google.googleEmail})` : undefined}>
        <Link href="/mentor/schedule" className="btn btn-primary btn-sm">Book a session</Link>
      </DashboardHeader>

      <div className="space-y-6">
        <NextSessionCard meeting={next} withName={next?.withName} emptyText="No sessions booked. Book one from your schedule." />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Sessions next 7 days" value={stats.weekAhead} href="/mentor/schedule" />
          <Stat label="Active mentees" value={stats.active} />
          <Stat label="Need a booking" value={stats.needBooking} href="/mentor/schedule" />
          <Stat label="Notes to write" value={stats.notesToWrite} href="/mentor/schedule" />
        </div>

        {!google && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold-soft px-6 py-4">
            <p className="text-sm text-ink">Connect Google Calendar so every session gets a Google Meet link and a calendar invite automatically.</p>
            <Link href="/mentor/settings" className="btn btn-primary btn-sm">Connect</Link>
          </div>
        )}

        <section>
          <h2 className="mb-4 text-2xl text-ink">Your mentees</h2>
          {enrollments.length === 0 ? (
            <EmptyState title="No mentees assigned yet">An admin will match you with mentees once they enrol.</EmptyState>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {enrollments.map((e) => {
                const done = e.goals.filter((g) => g.status === "DONE").length;
                const n = nextMeeting(e.meetings);
                return (
                  <Link key={e.id} href={`/mentor/mentees/${e.id}`} className="card block transition-colors hover:border-accent">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl text-ink">{e.mentee?.name ?? "Mentee"}</h3>
                        <p className="text-sm text-muted">{e.cohort.name}</p>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                    <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-xs text-muted uppercase">Next session</dt>
                        <dd className={`mt-1 ${n ? "text-ink" : "text-gold-ink"}`}>{n ? formatDateTime(n.scheduledAt) : "Needs booking"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted uppercase">Goals</dt>
                        <dd className="mt-1 text-ink">{e.goals.length ? `${done} / ${e.goals.length} done` : "None yet"}</dd>
                      </div>
                    </dl>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
