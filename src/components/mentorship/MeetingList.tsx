import Link from "next/link";
import type { Meeting } from "@prisma/client";
import { updateMeeting } from "@/lib/actions/mentorship";
import { ActionForm } from "@/components/ActionForm";
import { EmptyState, StatusBadge } from "@/components/ui";
import { formatDateTime, toDateTimeLocal } from "@/lib/format";
import { site } from "@/lib/site";
import { isUrl, joinLabel } from "@/components/calls/links";

export type MeetingRow = Meeting & { withName?: string | null; href?: string };

const dayFmt = new Intl.DateTimeFormat("en-IE", { weekday: "long", day: "numeric", month: "long", timeZone: site.timeZone });
const timeFmt = new Intl.DateTimeFormat("en-IE", { hour: "2-digit", minute: "2-digit", timeZone: site.timeZone });

/** Upcoming = scheduled and not yet finished; everything else is past. */
function splitMeetings(meetings: MeetingRow[]) {
  const now = Date.now();
  const isUpcoming = (m: Meeting) => m.status === "SCHEDULED" && +m.scheduledAt + m.durationMin * 60_000 > now;
  return {
    upcoming: meetings.filter(isUpcoming).sort((a, b) => +a.scheduledAt - +b.scheduledAt),
    past: meetings.filter((m) => !isUpcoming(m)).sort((a, b) => +b.scheduledAt - +a.scheduledAt),
  };
}

/**
 * Upcoming sessions grouped by day, then past sessions. Everyone gets
 * Join buttons; mentors (canManage) also get complete / cancel /
 * reschedule / notes controls on each session.
 */
export function MeetingList({
  meetings,
  canManage = false,
  title = "Sessions",
  showPast = true,
}: {
  meetings: MeetingRow[];
  canManage?: boolean;
  title?: string;
  showPast?: boolean;
}) {
  const { upcoming, past } = splitMeetings(meetings);

  const byDay = new Map<string, MeetingRow[]>();
  for (const m of upcoming) {
    const k = dayFmt.format(m.scheduledAt);
    byDay.set(k, [...(byDay.get(k) ?? []), m]);
  }

  return (
    <section className="card">
      <h2 className="mb-5 text-xl text-ink">{title}</h2>
      {upcoming.length === 0 && (
        <EmptyState title="Nothing booked">
          {canManage ? "Book a session and it will appear here." : "Your mentor will book your next session soon."}
        </EmptyState>
      )}

      <div className="space-y-6">
        {[...byDay].map(([day, items]) => (
          <div key={day}>
            <p className="mb-2 text-xs tracking-[0.2em] text-muted uppercase">{day}</p>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {items.map((m) => (
                <Row key={m.id} m={m} canManage={canManage} upcoming />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {showPast && past.length > 0 && (
        <details className="mt-8" open={upcoming.length === 0}>
          <summary className="cursor-pointer text-xs tracking-[0.2em] text-muted uppercase">Past sessions ({past.length})</summary>
          <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
            {past.map((m) => (
              <Row key={m.id} m={m} canManage={canManage} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function Row({ m, canManage, upcoming = false }: { m: MeetingRow; canManage: boolean; upcoming?: boolean }) {
  const needsNotes = canManage && !upcoming && m.status !== "CANCELLED" && !m.notes;
  return (
    <li className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink">
            {upcoming ? timeFmt.format(m.scheduledAt) : formatDateTime(m.scheduledAt)}
            <span className="font-normal text-muted"> · {m.durationMin} min</span>
            {m.withName && (
              <>
                <span className="font-normal text-muted"> · </span>
                {m.href ? <Link href={m.href} className="underline decoration-border underline-offset-4 hover:decoration-ink">{m.withName}</Link> : m.withName}
              </>
            )}
          </p>
          {m.agenda && <p className="mt-1 text-sm whitespace-pre-line text-muted">{m.agenda}</p>}
          {m.location && !isUrl(m.location) && <p className="mt-1 text-sm text-muted">{m.location}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {needsNotes ? <span className="text-xs text-gold-ink">Add notes</span> : <StatusBadge status={m.status} />}
          {upcoming && isUrl(m.location) && (
            <a href={m.location} target="_blank" rel="noreferrer" className="btn btn-accent btn-sm">{joinLabel(m.location)}</a>
          )}
          {upcoming && <a href={`/api/meetings/${m.id}/ics`} className="btn btn-ghost btn-sm">.ics</a>}
        </div>
      </div>

      {m.notes && !canManage && (
        <div className="mt-3 rounded-lg bg-surface-muted px-4 py-3">
          <p className="mb-1 text-xs tracking-wide text-muted uppercase">Mentor notes</p>
          <p className="text-sm whitespace-pre-line text-ink">{m.notes}</p>
        </div>
      )}

      {canManage && (
        <div className="mt-3 flex flex-wrap items-start gap-2">
          {upcoming && (
            <ActionForm action={updateMeeting.bind(null, m.id)} submitLabel="Cancel session" submitClassName="btn btn-danger btn-sm" pendingText="Cancelling…" className="space-y-2">
              <input type="hidden" name="status" value="CANCELLED" />
            </ActionForm>
          )}
          <details className="w-full">
            <summary className="cursor-pointer text-sm text-muted hover:text-ink">
              {upcoming ? "Reschedule or edit" : m.notes ? "Edit notes" : "Write notes & mark complete"}
            </summary>
            <ActionForm action={updateMeeting.bind(null, m.id)} submitLabel="Save" submitClassName="btn btn-primary btn-sm" className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_88px_150px]">
                <input name="scheduledAt" type="datetime-local" defaultValue={toDateTimeLocal(m.scheduledAt)} className="input" aria-label="Date and time" />
                <input name="durationMin" type="number" min={15} max={240} step={15} defaultValue={m.durationMin} className="input" aria-label="Minutes" />
                <select name="status" defaultValue={upcoming ? "SCHEDULED" : m.status === "SCHEDULED" ? "COMPLETED" : m.status} className="input" aria-label="Status">
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <input name="location" defaultValue={m.location ?? ""} placeholder="Video link or place" className="input" aria-label="Video link" />
              <textarea name="notes" rows={3} defaultValue={m.notes ?? ""} placeholder="Notes and action points. Your mentee can see these." className="input" aria-label="Notes" />
            </ActionForm>
          </details>
        </div>
      )}
    </li>
  );
}
