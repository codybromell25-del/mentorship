import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PageHeader, StatusBadge } from "@/components/ui";
import { GoalList } from "@/components/mentorship/GoalList";
import { MeetingList } from "@/components/mentorship/MeetingList";
import { ScheduleMeetingForm } from "@/components/mentorship/ScheduleMeetingForm";

export const metadata = { title: "Mentee" };

export default async function MenteeDetail({ params }: { params: Promise<{ enrollmentId: string }> }) {
  const { enrollmentId } = await params;
  const user = await requireUser(["MENTOR", "ADMIN"]);

  const e = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      mentee: { select: { name: true, email: true } },
      cohort: { select: { name: true } },
      application: { select: { currentRole: true, goals: true, background: true, linkedinUrl: true, studioName: true, studioLocation: true, studioStage: true, instructorStage: true, disciplines: true } },
      meetings: true,
      goals: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!e || (e.mentorId !== user.id && user.role !== "ADMIN")) notFound();

  const active = e.status === "ACTIVE";
  const [me, google] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { defaultDurationMin: true } }),
    prisma.googleAccount.findUnique({ where: { userId: user.id }, select: { id: true } }),
  ]);

  return (
    <>
      <Link href="/mentor" className="mb-6 inline-block text-sm text-muted hover:text-ink">← Overview</Link>
      <PageHeader eyebrow={e.cohort.name} title={e.mentee?.name ?? "Mentee"}>
        <div className="flex items-center gap-3">
          <StatusBadge status={e.status} />
          {e.mentee && <a href={`mailto:${e.mentee.email}`} className="btn btn-ghost btn-sm">Email</a>}
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <MeetingList meetings={e.meetings} canManage={active} />
          <GoalList enrollmentId={e.id} goals={e.goals} canEdit={active} />
        </div>
        <div className="space-y-6">
          {active && <ScheduleMeetingForm enrollmentId={e.id} defaultDurationMin={me.defaultDurationMin} googleConnected={!!google} />}
          <section className="card text-sm">
            <h2 className="mb-4 text-xl text-ink">From their application</h2>
            {e.application.studioName && (
              <>
                <p className="text-xs text-muted uppercase">Studio</p>
                <p className="mt-1 mb-4 text-ink">
                  {e.application.studioName} · {e.application.studioLocation}
                  <br />
                  <span className="text-muted">{e.application.studioStage}</span>
                </p>
              </>
            )}
            {e.application.instructorStage && (
              <>
                <p className="text-xs text-muted uppercase">Teaching</p>
                <p className="mt-1 mb-4 text-ink">
                  {e.application.instructorStage} · {e.application.disciplines}
                </p>
              </>
            )}
            <p className="text-xs text-muted uppercase">{e.application.studioName ? "Role" : "Teaches"}</p>
            <p className="mt-1 mb-4 text-ink">{e.application.currentRole}</p>
            <p className="text-xs text-muted uppercase">{e.application.studioName ? "Keeping them up at night" : "Knocks their confidence"}</p>
            <p className="mt-1 mb-4 whitespace-pre-line text-ink">{e.application.goals}</p>
            <p className="text-xs text-muted uppercase">{e.application.studioName ? "About the studio" : "Teaching so far"}</p>
            <p className="mt-1 whitespace-pre-line text-ink">{e.application.background}</p>
            {e.application.linkedinUrl && (
              <a href={e.application.linkedinUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block underline">{e.application.linkedinUrl}</a>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
