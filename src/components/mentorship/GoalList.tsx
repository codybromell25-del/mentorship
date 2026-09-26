import type { Goal } from "@prisma/client";
import { deleteGoal, setGoalStatus, addGoal } from "@/lib/actions/mentorship";
import { ActionForm } from "@/components/ActionForm";
import { EmptyState, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";

/** Goals for one enrollment, with add / progress / delete controls. */
export function GoalList({ enrollmentId, goals, canEdit = true }: { enrollmentId: string; goals: Goal[]; canEdit?: boolean }) {
  const done = goals.filter((g) => g.status === "DONE").length;

  return (
    <section className="card">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xl text-ink">Goals</h2>
        {goals.length > 0 && (
          <p className="text-sm text-muted">
            {done} of {goals.length} done
          </p>
        )}
      </div>

      {goals.length > 0 && (
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-success" style={{ width: `${(done / goals.length) * 100}%` }} />
        </div>
      )}

      {goals.length === 0 ? (
        <EmptyState title="No goals yet">Agree two or three goals in your first session and add them here.</EmptyState>
      ) : (
        <ul className="divide-y divide-border">
          {goals.map((g) => (
            <li key={g.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${g.status === "DONE" ? "text-muted line-through" : "text-ink"}`}>{g.title}</p>
                {g.detail && <p className="mt-1 text-sm whitespace-pre-line text-muted">{g.detail}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={g.status} />
                  {g.dueDate && <span className="text-xs text-muted">Due {formatDate(g.dueDate)}</span>}
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  {g.status === "NOT_STARTED" && (
                    <form action={setGoalStatus.bind(null, g.id, "IN_PROGRESS")}>
                      <button className="btn btn-ghost btn-sm">Start</button>
                    </form>
                  )}
                  {g.status !== "DONE" ? (
                    <form action={setGoalStatus.bind(null, g.id, "DONE")}>
                      <button className="btn btn-ghost btn-sm">Mark done</button>
                    </form>
                  ) : (
                    <form action={setGoalStatus.bind(null, g.id, "IN_PROGRESS")}>
                      <button className="btn btn-ghost btn-sm">Reopen</button>
                    </form>
                  )}
                  <form action={deleteGoal.bind(null, g.id)}>
                    <button className="btn btn-danger btn-sm" aria-label={`Delete goal ${g.title}`}>Delete</button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <details className="mt-5 border-t border-border pt-5">
          <summary className="cursor-pointer text-sm font-medium text-ink">+ Add a goal</summary>
          <ActionForm action={addGoal.bind(null, enrollmentId)} submitLabel="Add goal" submitClassName="btn btn-primary btn-sm" resetOnSuccess className="mt-4 space-y-3">
            <input name="title" required placeholder="e.g. Lead a project end to end" className="input" />
            <textarea name="detail" rows={2} placeholder="What does done look like? (optional)" className="input" />
            <div className="max-w-xs">
              <label className="label" htmlFor={`due-${enrollmentId}`}>Due date <span className="font-normal text-muted">(optional)</span></label>
              <input id={`due-${enrollmentId}`} name="dueDate" type="date" className="input" />
            </div>
          </ActionForm>
        </details>
      )}
    </section>
  );
}
