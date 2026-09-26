import type { Meeting } from "@prisma/client";
import { updateMeeting } from "@/lib/actions/mentorship";
import { ActionForm } from "@/components/ActionForm";
import { EmptyState, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

/**
 * Sessions for one enrollment. Mentors (canManage) get an inline form
 * per session to record notes and mark it completed or cancelled.
 */
export function MeetingList({ meetings, canManage = false }: { meetings: Meeting[]; canManage?: boolean }) {
  const now = new Date();
  const upcoming = meetings.filter((m) => m.status === "SCHEDULED" && m.scheduledAt >= now).sort((a, b) => +a.scheduledAt - +b.scheduledAt);
  const past = meetings.filter((m) => !upcoming.includes(m)).sort((a, b) => +b.scheduledAt - +a.scheduledAt);

  return (
    <section className="card">
      <h2 className="mb-5 text-xl text-ink">Sessions</h2>
      {meetings.length === 0 ? (
        <EmptyState title="No sessions booked yet">
          {canManage ? "Book the first session below." : "Your mentor will book your first session soon."}
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && <Group title="Upcoming" meetings={upcoming} canManage={canManage} />}
          {past.length > 0 && <Group title="Past" meetings={past} canManage={canManage} />}
        </div>
      )}
    </section>
  );
}

function Group({ title, meetings, canManage }: { title: string; meetings: Meeting[]; canManage: boolean }) {
  return (
    <div>
      <p className="mb-2 text-xs tracking-wide text-muted uppercase">{title}</p>
      <ul className="divide-y divide-border">
        {meetings.map((m) => (
          <li key={m.id} className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-ink">
                {formatDateTime(m.scheduledAt)} <span className="font-normal text-muted">· {m.durationMin} min</span>
              </p>
              <StatusBadge status={m.status} />
            </div>
            {m.location && (
              <p className="mt-1 text-sm break-all text-muted">
                {/^https?:\/\//.test(m.location) ? (
                  <a href={m.location} target="_blank" rel="noreferrer" className="underline hover:text-ink">{m.location}</a>
                ) : (
                  m.location
                )}
              </p>
            )}
            {m.agenda && <p className="mt-2 text-sm whitespace-pre-line text-ink">{m.agenda}</p>}
            {m.notes && !canManage && (
              <div className="mt-3 rounded-lg bg-surface-muted px-4 py-3">
                <p className="mb-1 text-xs tracking-wide text-muted uppercase">Mentor notes</p>
                <p className="text-sm whitespace-pre-line text-ink">{m.notes}</p>
              </div>
            )}
            {canManage && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-muted hover:text-ink">
                  {m.notes ? "Edit notes & status" : "Add notes & status"}
                </summary>
                <ActionForm action={updateMeeting.bind(null, m.id)} submitLabel="Save" submitClassName="btn btn-primary btn-sm" className="mt-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select name="status" defaultValue={m.status} className="input">
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <input name="location" defaultValue={m.location ?? ""} placeholder="Video link or place" className="input" />
                  </div>
                  <textarea name="notes" rows={4} defaultValue={m.notes ?? ""} placeholder="Notes and action points — your mentee can see these." className="input" />
                </ActionForm>
              </details>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
