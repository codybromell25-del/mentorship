import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatDateTime } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export const metadata = { title: "My mentees" };

export default async function MentorHome() {
  const user = await requireUser(["MENTOR", "ADMIN"]);

  const enrollments = await prisma.enrollment.findMany({
    where: { mentorId: user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: [{ status: "asc" }, { paidAt: "desc" }],
    include: {
      mentee: { select: { name: true, email: true } },
      cohort: { select: { name: true } },
      goals: { select: { status: true } },
      meetings: { where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } }, orderBy: { scheduledAt: "asc" }, take: 1 },
    },
  });

  return (
    <>
      <PageHeader eyebrow="Mentor" title={`Hi, ${user.name.split(" ")[0]}`} />
      {enrollments.length === 0 ? (
        <EmptyState title="No mentees assigned yet">An admin will match you with mentees once they enrol.</EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {enrollments.map((e) => {
            const done = e.goals.filter((g) => g.status === "DONE").length;
            const next = e.meetings[0];
            return (
              <Link key={e.id} href={`/mentor/mentees/${e.id}`} className="card block transition-colors hover:border-ink/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl text-ink">{e.mentee?.name ?? "Mentee"}</h2>
                    <p className="text-sm text-muted">{e.cohort.name}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted uppercase">Next session</dt>
                    <dd className="mt-1 text-ink">{next ? formatDateTime(next.scheduledAt) : "Not booked"}</dd>
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
    </>
  );
}
