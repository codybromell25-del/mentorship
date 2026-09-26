import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { homeFor, requireUser } from "@/lib/session";
import { site } from "@/lib/site";
import { formatDate, formatDateTime } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";
import { GoalList } from "@/components/mentorship/GoalList";
import { MeetingList } from "@/components/mentorship/MeetingList";

export const metadata = { title: "Dashboard" };

export default async function MenteeDashboard() {
  const user = await requireUser();
  if (user.role !== "MENTEE") redirect(homeFor(user.role));

  const enrollment = await prisma.enrollment.findFirst({
    where: { menteeId: user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: [{ status: "asc" }, { paidAt: "desc" }],
    include: {
      cohort: true,
      mentor: { select: { name: true, email: true, headline: true, bio: true } },
      meetings: true,
      goals: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!enrollment) {
    return (
      <>
        <PageHeader title={`Hi, ${user.name.split(" ")[0]}`} />
        <EmptyState title="You're not enrolled in a cohort yet">
          If you&apos;ve just paid, give it a minute and refresh. Otherwise contact {site.contactEmail}.
        </EmptyState>
      </>
    );
  }

  const nextMeeting = enrollment.meetings
    .filter((m) => m.status === "SCHEDULED" && m.scheduledAt >= new Date())
    .sort((a, b) => +a.scheduledAt - +b.scheduledAt)[0];

  return (
    <>
      <PageHeader eyebrow={enrollment.cohort.name} title={`Hi, ${user.name.split(" ")[0]}`}>
        <p className="text-sm text-muted">
          {formatDate(enrollment.cohort.startDate)} – {formatDate(enrollment.cohort.endDate)}
        </p>
      </PageHeader>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
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

        <section className="card">
          <p className="eyebrow mb-3">Next session</p>
          {nextMeeting ? (
            <>
              <h2 className="text-2xl text-ink">{formatDateTime(nextMeeting.scheduledAt)}</h2>
              <p className="mt-1 text-sm text-muted">{nextMeeting.durationMin} minutes</p>
              {nextMeeting.location && /^https?:\/\//.test(nextMeeting.location) && (
                <a href={nextMeeting.location} target="_blank" rel="noreferrer" className="btn btn-accent btn-sm mt-5">Join session</a>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Nothing booked yet.</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GoalList enrollmentId={enrollment.id} goals={enrollment.goals} canEdit={enrollment.status === "ACTIVE"} />
        <MeetingList meetings={enrollment.meetings} />
      </div>
    </>
  );
}
