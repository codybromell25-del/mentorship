import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { softwareName } from "@/lib/software";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { toggleEnquiryHandled } from "../actions";

export const metadata = { title: "balanceHQ enquiries" };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const handled = show === "handled";
  const [enquiries, leads] = await Promise.all([
    prisma.softwareEnquiry.findMany({ where: { handled }, orderBy: { createdAt: handled ? "desc" : "asc" } }),
    prisma.application.findMany({
      where: { wantsSoftware: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, studioName: true, createdAt: true },
    }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Admin" title="balanceHQ enquiries" />
      <div className="mb-6 flex gap-2">
        <Link href="/admin/enquiries" className={`btn btn-sm ${!handled ? "btn-primary" : "btn-ghost"}`}>Open</Link>
        <Link href="/admin/enquiries?show=handled" className={`btn btn-sm ${handled ? "btn-primary" : "btn-ghost"}`}>Handled</Link>
      </div>

      {enquiries.length === 0 ? (
        <EmptyState title={handled ? "Nothing handled yet" : "No open enquiries"} />
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => (
            <div key={e.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{e.studioName}{e.studioLocation ? `, ${e.studioLocation}` : ""}</p>
                  <p className="text-sm text-muted">
                    {e.name} · <a href={`mailto:${e.email}?subject=balanceHQ`} className="underline">{e.email}</a> · {formatDate(e.createdAt)}
                  </p>
                </div>
                <form action={toggleEnquiryHandled.bind(null, e.id)}>
                  <button className="btn btn-ghost btn-sm">{e.handled ? "Reopen" : "Mark handled"}</button>
                </form>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {e.bookingSystem && <Badge>{e.bookingSystem}</Badge>}
                {e.tools.map((t) => (
                  <Badge key={t} tone="accent">{softwareName(t)}</Badge>
                ))}
              </div>
              {e.message && <p className="mt-4 text-sm whitespace-pre-line text-ink">{e.message}</p>}
            </div>
          ))}
        </div>
      )}

      {leads.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-2 text-xl text-ink">From mentorship applications</h2>
          <p className="mb-4 text-sm text-muted">Studio applicants who ticked &ldquo;also interested in balanceHQ&rdquo;.</p>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {leads.map((l) => (
              <li key={l.id} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-sm">
                <span className="text-ink">{l.studioName ?? l.name} · {l.name}</span>
                <a href={`mailto:${l.email}?subject=balanceHQ`} className="text-muted underline">{l.email}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
