import Link from "next/link";
import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { Badge, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { acceptApplication, decideApplication, resendPaymentLink, saveApplicationNotes } from "../actions";

export const metadata = { title: "Applications" };

const FILTERS: { key: ApplicationStatus; label: string }[] = [
  { key: "PENDING", label: "To review" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "WAITLISTED", label: "Waitlist" },
  { key: "REJECTED", label: "Declined" },
];

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = (FILTERS.find((f) => f.key === raw)?.key ?? "PENDING") as ApplicationStatus;

  const [apps, counts] = await Promise.all([
    prisma.application.findMany({
      where: { status },
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      include: { cohort: { select: { name: true, track: true } }, enrollment: { select: { id: true, status: true } } },
    }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: ApplicationStatus) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Applications" />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/applications?status=${f.key}`}
            className={`btn btn-sm ${f.key === status ? "btn-primary" : "btn-ghost"}`}
          >
            {f.label} <span className="opacity-60">{countFor(f.key)}</span>
          </Link>
        ))}
      </div>

      {apps.length === 0 ? (
        <EmptyState title="Nothing here" />
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <details key={a.id} className="card group" open={apps.length === 1}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-medium text-ink">
                    {a.name}
                    <Badge tone={a.cohort.track === "STUDIO" ? "success" : "accent"}>{a.cohort.track === "STUDIO" ? "Studio" : "Student"}</Badge>
                    {a.wantsSoftware && <Badge tone="warning">Wants balanceHQ</Badge>}
                  </p>
                  <p className="text-sm text-muted">
                    {a.email} · {a.studioName ? `${a.studioName}, ${a.studioLocation}` : a.currentRole}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span>{a.cohort.name}</span>
                  <span>{formatDate(a.createdAt)}</span>
                  {a.enrollment ? <StatusBadge status={a.enrollment.status} /> : <StatusBadge status={a.status} />}
                </div>
              </summary>

              <div className="mt-6 grid gap-6 border-t border-border pt-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4 text-sm">
                  {a.studioName && (
                    <Field label="Studio" value={`${a.studioName} · ${a.studioLocation} · ${a.studioStage}`} />
                  )}
                  <Field label="Role" value={a.currentRole} />
                  <Field label={a.studioName ? "About the studio" : "Background"} value={a.background} />
                  <Field label="Wants help with" value={a.goals} />
                  {a.linkedinUrl && (
                    <a href={a.linkedinUrl} target="_blank" rel="noreferrer" className="inline-block underline">
                      {a.linkedinUrl}
                    </a>
                  )}
                  <ActionForm action={saveApplicationNotes.bind(null, a.id)} submitLabel="Save notes" submitClassName="btn btn-ghost btn-sm" className="space-y-2 pt-2">
                    <label className="label" htmlFor={`notes-${a.id}`}>Private notes</label>
                    <textarea id={`notes-${a.id}`} name="adminNotes" rows={2} defaultValue={a.adminNotes ?? ""} className="input" />
                  </ActionForm>
                </div>

                <div className="space-y-3">
                  {!a.enrollment && (
                    <ActionForm action={acceptApplication.bind(null, a.id)} submitLabel="Accept & send payment link" submitClassName="btn btn-accent w-full" pendingText="Accepting…">
                      {null}
                    </ActionForm>
                  )}
                  {a.enrollment?.status === "AWAITING_PAYMENT" && (
                    <ActionForm action={resendPaymentLink.bind(null, a.enrollment.id)} submitLabel="Resend payment link" submitClassName="btn btn-ghost w-full">
                      {null}
                    </ActionForm>
                  )}
                  {a.status !== "WAITLISTED" && (!a.enrollment || a.enrollment.status === "CANCELLED") && (
                    <ActionForm action={decideApplication.bind(null, a.id, "WAITLISTED")} submitLabel="Waitlist" submitClassName="btn btn-ghost w-full">
                      {null}
                    </ActionForm>
                  )}
                  {a.status !== "REJECTED" && (!a.enrollment || a.enrollment.status === "CANCELLED") && (
                    <ActionForm action={decideApplication.bind(null, a.id, "REJECTED")} submitLabel="Decline" submitClassName="btn btn-danger w-full">
                      {null}
                    </ActionForm>
                  )}
                  <p className="text-xs text-muted">Every decision emails the applicant.</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase">{label}</p>
      <p className="mt-1 whitespace-pre-line text-ink">{value}</p>
    </div>
  );
}
