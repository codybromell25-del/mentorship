import Link from "next/link";
import { redirect } from "next/navigation";
import { homeFor, requireUser } from "@/lib/session";
import { site } from "@/lib/site";
import { formatDate, formatDateTime } from "@/lib/format";
import { getMenteeEnrollment, nextMeeting } from "@/lib/queries";
import { EmptyState } from "@/components/ui";
import { DashboardHeader } from "@/components/DashboardHeader";
import { NextSessionCard } from "@/components/calls/NextSessionCard";
import { GoalList } from "@/components/mentorship/GoalList";

export const metadata = { title: "Dashboard" };

export default async function MenteeDashboard() {
  const user = await requireUser();
  if (user.role !== "MENTEE") redirect(homeFor(user.role));
  const enrollment = await getMenteeEnrollment(user.id);

  if (!enrollment) {
    return (
      <>
        <DashboardHeader eyebrow="Welcome" name={user.name} />
        <EmptyState title="You're not enrolled yet">
          If you&apos;ve just paid, give it a minute and refresh. Otherwise contact {site.contactEmail}.
        </EmptyState>
      </>
    );
  }

  const next = nextMeeting(enrollment.meetings);
  const lastNotes = enrollment.meetings
    .filter((m) => m.status === "COMPLETED" && m.notes)
    .sort((a, b) => +b.scheduledAt - +a.scheduledAt)[0];

  return (
    <>
      <DashboardHeader
        eyebrow={enrollment.cohort.name}
        name={user.name}
        subtitle={`${formatDate(enrollment.cohort.startDate)} – ${formatDate(enrollment.cohort.endDate)}`}
      >
        <Link href="/dashboard/sessions" className="btn btn-ghost btn-sm">All sessions</Link>
      </DashboardHeader>

      <div className="space-y-6">
        <NextSessionCard
          meeting={next}
          withName={enrollment.mentor?.name}
          emptyText={enrollment.mentor ? `${enrollment.mentor.name.split(" ")[0]} will book your next session soon.` : "Your first session will appear here once you're matched."}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <section className="card">
              <p className="eyebrow mb-3">Your mentor</p>
              {enrollment.mentor ? (
                <>
                  <h2 className="text-2xl text-ink">{enrollment.mentor.name}</h2>
                  {enrollment.mentor.headline && <p className="mt-1 text-sm text-muted">{enrollment.mentor.headline}</p>}
                  {enrollment.mentor.bio && <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-ink">{enrollment.mentor.bio}</p>}
                  <a href={`mailto:${enrollment.mentor.email}`} className="btn btn-ghost btn-sm mt-5">Email {enrollment.mentor.name.split(" ")[0]}</a>
                </>
              ) : (
                <p className="text-sm text-muted">We&apos;re matching you with a mentor now. You&apos;ll get an email as soon as it&apos;s done.</p>
              )}
            </section>

            {lastNotes && (
              <section className="card">
                <p className="eyebrow mb-3">Notes from your last session</p>
                <p className="mb-3 text-sm text-muted">{formatDateTime(lastNotes.scheduledAt)}</p>
                <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{lastNotes.notes}</p>
                <Link href="/dashboard/sessions" className="mt-4 inline-block text-sm text-accent underline">All session notes</Link>
              </section>
            )}
          </div>

          <GoalList enrollmentId={enrollment.id} goals={enrollment.goals} canEdit={enrollment.status === "ACTIVE"} />
        </div>
      </div>
    </>
  );
}
