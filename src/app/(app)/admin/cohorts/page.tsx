import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { createCohort, toggleCohortOpen } from "../actions";

export const metadata = { title: "Cohorts" };

export default async function CohortsPage() {
  const cohorts = await prisma.cohort.findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: {
          applications: { where: { status: "PENDING" } },
          enrollments: { where: { status: { in: ["AWAITING_PAYMENT", "ACTIVE", "COMPLETED"] } } },
        },
      },
    },
  });

  return (
    <>
      <PageHeader eyebrow="Admin" title="Cohorts" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {cohorts.length === 0 ? (
            <EmptyState title="No cohorts yet">Create your first cohort to start taking applications.</EmptyState>
          ) : (
            <div className="space-y-4">
              {cohorts.map((c) => (
                <div key={c.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl text-ink">{c.name}</h2>
                        {c.isOpen ? <Badge tone="success">Open</Badge> : <Badge>Closed</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(c.startDate)} – {formatDate(c.endDate)} · {formatMoney(c.priceCents, c.currency)}
                      </p>
                    </div>
                    <form action={toggleCohortOpen.bind(null, c.id)}>
                      <button className="btn btn-ghost btn-sm">{c.isOpen ? "Close applications" : "Open applications"}</button>
                    </form>
                  </div>
                  <div className="mt-4 flex gap-6 text-sm">
                    <Link href={`/admin/enrollments?cohort=${c.id}`} className="text-muted hover:text-ink">
                      <span className="font-medium text-ink">{c._count.enrollments}</span> / {c.capacity} places taken
                    </Link>
                    <Link href="/admin/applications" className="text-muted hover:text-ink">
                      <span className="font-medium text-ink">{c._count.applications}</span> to review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <section className="card h-fit">
          <h2 className="mb-5 text-xl text-ink">New cohort</h2>
          <ActionForm action={createCohort} submitLabel="Create cohort" resetOnSuccess>
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" name="name" required placeholder="e.g. Spring 2027" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="startDate">Starts</label>
                <input id="startDate" name="startDate" type="date" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="endDate">Ends</label>
                <input id="endDate" name="endDate" type="date" required className="input" />
              </div>
            </div>
            <div className="grid grid-cols-[1fr_90px] gap-3">
              <div>
                <label className="label" htmlFor="price">Price</label>
                <input id="price" name="price" type="number" min={1} step="0.01" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="currency">Currency</label>
                <select id="currency" name="currency" className="input">
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="usd">USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="capacity">Places</label>
              <input id="capacity" name="capacity" type="number" min={1} defaultValue={12} required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="description">Description <span className="font-normal text-muted">(optional)</span></label>
              <textarea id="description" name="description" rows={3} className="input" />
            </div>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
