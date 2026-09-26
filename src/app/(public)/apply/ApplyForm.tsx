"use client";

import { useActionState } from "react";
import { submitApplication, type ApplyState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

type CohortOption = { id: string; label: string };

export function ApplyForm({ cohorts, defaultCohortId }: { cohorts: CohortOption[]; defaultCohortId?: string }) {
  const [state, action] = useActionState<ApplyState, FormData>(submitApplication, null);
  const v = state?.values ?? {};

  return (
    <form action={action} className="card space-y-5">
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

      <div>
        <label className="label" htmlFor="cohortId">Cohort</label>
        <select id="cohortId" name="cohortId" required className="input" defaultValue={v.cohortId ?? defaultCohortId ?? cohorts[0]?.id}>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="currentRole">Current role</label>
          <input id="currentRole" name="currentRole" required className="input" placeholder="e.g. Product designer at a startup" defaultValue={v.currentRole} />
        </div>
        <div>
          <label className="label" htmlFor="linkedinUrl">LinkedIn <span className="font-normal text-muted">(optional)</span></label>
          <input id="linkedinUrl" name="linkedinUrl" type="url" className="input" placeholder="https://linkedin.com/in/…" defaultValue={v.linkedinUrl} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="background">Your background</label>
        <textarea id="background" name="background" required rows={4} className="input" defaultValue={v.background} />
        <p className="hint">Where you are in your career and what you&apos;ve worked on.</p>
      </div>

      <div>
        <label className="label" htmlFor="goals">What do you want from mentorship?</label>
        <textarea id="goals" name="goals" required rows={4} className="input" defaultValue={v.goals} />
        <p className="hint">The more specific, the better we can match you.</p>
      </div>

      {/* Honeypot for bots — hidden from people and screen readers. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <SubmitButton className="btn btn-accent w-full sm:w-auto" pendingText="Sending…">
        Submit application
      </SubmitButton>
    </form>
  );
}
