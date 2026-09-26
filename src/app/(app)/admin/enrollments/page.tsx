import Link from "next/link";
import type { EnrollmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { assignMentor, resendPaymentLink, setEnrollmentStatus } from "../actions";

export const metadata = { title: "Enrollments" };

const STATUSES: EnrollmentStatus[] = ["ACTIVE", "AWAITING_PAYMENT", "COMPLETED", "CANCELLED"];

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; unassigned?: string; cohort?: string }>;
}) {
  const sp = await searchParams;
  const status = (STATUSES.find((s) => s === sp.status) ?? "ACTIVE") as EnrollmentStatus;
  const where: Prisma.EnrollmentWhereInput = { status };
  if (sp.unassigned) where.mentorId = null;
  if (sp.cohort) where.cohortId = sp.cohort;

  const [enrollments, mentors] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        application: { select: { name: true, email: true } },
        cohort: { select: { name: true } },
        mentor: { select: { id: true, name: true } },
        _count: { select: { meetings: true, goals: true } },
      },
    }),
    prisma.user.findMany({ where: { role: "MENTOR" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Admin" title="Enrollments" />

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/enrollments?status=${s}`} className={`btn btn-sm ${s === status && !sp.unassigned ? "btn-primary" : "btn-ghost"}`}>
            {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
          </Link>
        ))}
        <Link href="/admin/enrollments?status=ACTIVE&unassigned=1" className={`btn btn-sm ${sp.unassigned ? "btn-primary" : "btn-ghost"}`}>
          Need a mentor
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState title="No enrollments match" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="table">
            <thead>
              <tr>
                <th>Mentee</th>
                <th>Cohort</th>
                <th>Paid</th>
                <th>Mentor</th>
                <th>Activity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td>
                    <p className="font-medium text-ink">{e.application.name}</p>
                    <p className="text-xs text-muted">{e.application.email}</p>
                  </td>
                  <td className="text-muted">{e.cohort.name}</td>
                  <td>
                    {e.paidAt ? (
                      <>
                        <p className="text-ink">{formatMoney(e.amountCents, e.currency)}</p>
                        <p className="text-xs text-muted">{formatDate(e.paidAt)}</p>
                      </>
                    ) : (
                      <StatusBadge status={e.status} />
                    )}
                  </td>
                  <td className="min-w-56">
                    {e.status === "ACTIVE" || e.status === "COMPLETED" ? (
                      <ActionForm action={assignMentor.bind(null, e.id)} submitLabel="Save" submitClassName="btn btn-ghost btn-sm" className="flex items-center gap-2">
                        <select name="mentorId" defaultValue={e.mentor?.id ?? ""} className="input py-1.5">
                          <option value="">— Unassigned —</option>
                          {mentors.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </ActionForm>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="text-xs text-muted">
                    {e._count.meetings} sessions
                    <br />
                    {e._count.goals} goals
                  </td>
                  <td>
                    <div className="flex flex-col items-end gap-2">
                      {(e.status === "ACTIVE" || e.status === "COMPLETED") && (
                        <Link href={`/mentor/mentees/${e.id}`} className="btn btn-ghost btn-sm">Open</Link>
                      )}
                      {e.status === "AWAITING_PAYMENT" && (
                        <ActionForm action={resendPaymentLink.bind(null, e.id)} submitLabel="Resend link" submitClassName="btn btn-ghost btn-sm" className="space-y-2 text-right">
                          {null}
                        </ActionForm>
                      )}
                      {e.status === "ACTIVE" && (
                        <ActionForm action={setEnrollmentStatus.bind(null, e.id, "COMPLETED")} submitLabel="Mark complete" submitClassName="btn btn-ghost btn-sm" className="space-y-2 text-right">
                          {null}
                        </ActionForm>
                      )}
                      {(e.status === "ACTIVE" || e.status === "AWAITING_PAYMENT") && (
                        <ActionForm action={setEnrollmentStatus.bind(null, e.id, "CANCELLED")} submitLabel="Cancel" submitClassName="btn btn-danger btn-sm" className="space-y-2 text-right">
                          {null}
                        </ActionForm>
                      )}
                      {(e.status === "COMPLETED" || e.status === "CANCELLED") && e.paidAt && (
                        <ActionForm action={setEnrollmentStatus.bind(null, e.id, "ACTIVE")} submitLabel="Reactivate" submitClassName="btn btn-ghost btn-sm" className="space-y-2 text-right">
                          {null}
                        </ActionForm>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">Cancelling doesn&apos;t refund in Stripe — issue refunds from the Stripe dashboard.</p>
    </>
  );
}
