"use client";

import { useActionState } from "react";
import { submitApplication, type ApplyState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";
import { DISCIPLINES, INSTRUCTOR_STAGES } from "@/content/instructors";

type CohortOption = { id: string; label: string };

const STUDIO_STAGES = ["Opening in the next year", "Open less than 1 year", "Open 1–3 years", "Open 3+ years", "Multiple studios"];

export function ApplyForm({
  cohorts,
  defaultCohortId,
  track,
}: {
  cohorts: CohortOption[];
  defaultCohortId?: string;
  track: "STUDIO" | "INSTRUCTOR";
}) {
  const [state, action] = useActionState<ApplyState, FormData>(submitApplication, null);
  const v = state?.values ?? {};
  const studio = track === "STUDIO";

  return (
    <form action={action} className="space-y-6 rounded-[2rem] border border-border bg-surface p-6 sm:p-10">
      <FormMessage state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" required className="input" defaultValue={v.name} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" defaultValue={v.email} autoComplete="email" />
        </div>
      </div>

      {cohorts.length > 1 ? (
        <div>
          <label className="label" htmlFor="cohortId">Intake</label>
          <select id="cohortId" name="cohortId" required className="input" defaultValue={v.cohortId ?? defaultCohortId ?? cohorts[0]?.id}>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <input type="hidden" name="cohortId" value={cohorts[0].id} />
          <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink">{cohorts[0].label}</p>
        </>
      )}

      {studio ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="studioName">Studio name</label>
              <input id="studioName" name="studioName" required className="input" defaultValue={v.studioName} />
            </div>
            <div>
              <label className="label" htmlFor="studioLocation">Location</label>
              <input id="studioLocation" name="studioLocation" required className="input" placeholder="e.g. Galway" defaultValue={v.studioLocation} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="studioStage">Where is your studio at?</label>
            <select id="studioStage" name="studioStage" required className="input" defaultValue={v.studioStage ?? ""}>
              <option value="" disabled>Choose one</option>
              {STUDIO_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="instructorStage">Where are you in your teaching?</label>
            <select id="instructorStage" name="instructorStage" required className="input" defaultValue={v.instructorStage ?? ""}>
              <option value="" disabled>Choose one</option>
              {INSTRUCTOR_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="disciplines">What do you teach?</label>
            <select id="disciplines" name="disciplines" required className="input" defaultValue={v.disciplines ?? ""}>
              <option value="" disabled>Choose one</option>
              {DISCIPLINES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="currentRole">{studio ? "Your role" : "Where do you teach now?"}</label>
          <input
            id="currentRole"
            name="currentRole"
            required
            className="input"
            placeholder={studio ? "e.g. Owner and lead instructor" : "e.g. Four reformer classes a week in Cork"}
            defaultValue={v.currentRole}
          />
        </div>
        <div>
          <label className="label" htmlFor="linkedinUrl">
            {studio ? "Studio website or Instagram" : "Instagram or website"} <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="linkedinUrl" name="linkedinUrl" type="url" className="input" placeholder="https://…" defaultValue={v.linkedinUrl} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="background">{studio ? "Tell us about your studio" : "Tell us about your teaching so far"}</label>
        <textarea id="background" name="background" required rows={4} className="input" defaultValue={v.background} />
        <p className="hint">
          {studio
            ? "Size, instructors, classes per week, and what's working and what isn't."
            : "Your training, how long you've been teaching, and the kinds of classes you teach."}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="goals">{studio ? "What's keeping you up at night?" : "What part of teaching knocks your confidence?"}</label>
        <textarea id="goals" name="goals" required rows={4} className="input" defaultValue={v.goals} />
        <p className="hint">
          {studio
            ? "The more honest you are, the more useful your first session will be."
            : "Be as honest as you like. Only our team and your mentor will read this."}
        </p>
      </div>

      {studio && (
        <label className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-ink">
          <input type="checkbox" name="wantsSoftware" className="mt-0.5 h-4 w-4 accent-[var(--accent)]" defaultChecked={v.wantsSoftware === "on"} />
          <span>
            I&apos;d also like to hear about <span className="font-medium">balanceHQ</span> studio software (sold separately):
            reporting, instructor KPIs, time off and more.
          </span>
        </label>
      )}

      {/* Honeypot for bots — hidden from people and screen readers. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <SubmitButton className="btn btn-accent" pendingText="Sending…">Submit application</SubmitButton>
        <p className="text-xs text-muted">Free to apply · we reply within a week</p>
      </div>
    </form>
  );
}
