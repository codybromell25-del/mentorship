import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { site } from "@/lib/site";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "Apply" };
export const dynamic = "force-dynamic";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ cohort?: string }> }) {
  const { cohort } = await searchParams;
  const cohorts = await prisma.cohort.findMany({
    where: { isOpen: true, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow mb-3">Apply</p>
      <h1 className="text-4xl text-ink">Apply for {site.name}</h1>
      <p className="mt-4 mb-10 leading-relaxed text-muted">
        Applying is free. We review every application personally and reply within a week.
      </p>
      {cohorts.length === 0 ? (
        <div className="card">
          <p className="text-ink">Applications are closed right now.</p>
          <p className="mt-1 text-sm text-muted">Email {site.contactEmail} to hear when the next cohort opens.</p>
        </div>
      ) : (
        <ApplyForm
          defaultCohortId={cohort}
          cohorts={cohorts.map((c) => ({
            id: c.id,
            label: `${c.name} · starts ${formatDate(c.startDate)} · ${formatMoney(c.priceCents, c.currency)}`,
          }))}
        />
      )}
    </div>
  );
}
