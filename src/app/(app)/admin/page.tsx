import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Admin" };

export default async function AdminOverview() {
  const now = new Date();
  const [pending, awaitingPayment, active, unassigned, revenue, upcoming, cohorts] = await Promise.all([
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.enrollment.count({ where: { status: "AWAITING_PAYMENT" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE", mentorId: null } }),
    prisma.enrollment.groupBy({ by: ["currency"], where: { paidAt: { not: null } }, _sum: { amountCents: true } }),
    prisma.meeting.findMany({
      where: { status: "SCHEDULED", scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      take: 6,
      include: { enrollment: { include: { mentee: { select: { name: true } }, mentor: { select: { name: true } } } } },
    }),
    prisma.cohort.findMany({
      where: { endDate: { gte: now } },
      orderBy: { startDate: "asc" },
      include: { _count: { select: { enrollments: { where: { status: { in: ["AWAITING_PAYMENT", "ACTIVE"] } } } } } },
    }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Admin" title="Overview" />

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="To review" value={pending} href="/admin/applications" />
        <Stat label="Awaiting payment" value={awaitingPayment} href="/admin/enrollments?status=AWAITING_PAYMENT" />
        <Stat label="Active mentees" value={active} href="/admin/enrollments" />
        <Stat label="Need a mentor" value={unassigned} href="/admin/enrollments?unassigned=1" />
        <Stat
          label="Revenue"
          value={revenue.length ? revenue.map((r) => formatMoney(r._sum.amountCents ?? 0, r.currency)).join(" + ") : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 text-xl text-ink">Current & upcoming intakes</h2>
          {cohorts.length === 0 ? (
            <p className="text-sm text-muted">
              None yet. <Link href="/admin/cohorts" className="underline">Create one</Link>.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {cohorts.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{c.name}</p>
                    <p className="text-muted">Starts {formatDate(c.startDate)}</p>
                  </div>
                  <p className="text-muted">
                    <span className="font-medium text-ink">{c._count.enrollments}</span> / {c.capacity} places
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="mb-4 text-xl text-ink">Upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted">No sessions booked.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((m) => (
                <li key={m.id} className="py-3 text-sm">
                  <p className="font-medium text-ink">{formatDateTime(m.scheduledAt)}</p>
                  <p className="text-muted">
                    {m.enrollment.mentor?.name ?? "?"} with {m.enrollment.mentee?.name ?? "?"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
