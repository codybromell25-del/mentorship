import Link from "next/link";
import type { ReactNode } from "react";

const tones = {
  neutral: "bg-surface-muted text-muted",
  accent: "bg-gold-soft text-gold-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
} as const;

export type Tone = keyof typeof tones;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

const statusTones: Record<string, Tone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  WAITLISTED: "neutral",
  REJECTED: "danger",
  AWAITING_PAYMENT: "warning",
  ACTIVE: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  SCHEDULED: "accent",
  NOT_STARTED: "neutral",
  IN_PROGRESS: "accent",
  DONE: "success",
};

/** Badge for any enum status value, e.g. AWAITING_PAYMENT → "Awaiting payment". */
export function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
  return <Badge tone={statusTones[status] ?? "neutral"}>{label}</Badge>;
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl text-ink">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, href }: { label: string; value: ReactNode; href?: string }) {
  const body = (
    <>
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 font-heading text-3xl text-ink">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="card block transition-colors hover:border-ink/30">
      {body}
    </Link>
  ) : (
    <div className="card">{body}</div>
  );
}

export function FormMessage({ state }: { state: { error?: string; ok?: string } | null | undefined }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>;
  if (state.ok) return <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{state.ok}</p>;
  return null;
}
