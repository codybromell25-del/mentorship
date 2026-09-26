"use client";

import { useActionState } from "react";
import { submitApplication, type ApplyState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

type CohortOption = { id: string; label: string };

const STUDIO_STAGES = ["Opening in the next year", "Open less than 1 year", "Open 1–3 years", "Open 3+ years", "Multiple studios"];

export function ApplyForm({
  cohorts,
  defaultCohortId,
  track,
}: {
  cohorts: CohortOption[];
  defaultCohortId?: string;
  track: "STUDIO" | "STUDENT";
}) {
  const [state, action] = useActionState<ApplyState, FormData>(submitApplication, null);
  const v = state?.values ?? {};
  const studio = track === "STUDIO";

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
          <p className="rounded-lg bg-surface-muted px-4 py-3 text-sm text-ink">{cohorts[0].label}</p>
        </>
      )}

      {studio && (
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
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="currentRole">{studio ? "Your role" : "Where are you now?"}</label>
          <input
            id="currentRole"
            name="currentRole"
            required
            className="input"
            placeholder={studio ? "e.g. Owner and lead instructor" : "e.g. balance education student, Mat pathway"}
            defaultValue={v.currentRole}
          />
        </div>
        <div>
          <label className="label" htmlFor="linkedinUrl">
            {studio ? "Studio website or Instagram" : "LinkedIn or Instagram"} <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="linkedinUrl" name="linkedinUrl" type="url" className="input" placeholder="https://…" defaultValue={v.linkedinUrl} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="background">{studio ? "Tell us about your studio" : "Your background"}</label>
        <textarea id="background" name="background" required rows={4} className="input" defaultValue={v.background} />
        <p className="hint">
          {studio
            ? "Size, number of instructors, classes per week, what's working and what isn't."
            : "Your Pilates training so far and any teaching experience."}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="goals">{studio ? "What do you most want help with?" : "What do you want from a mentor?"}</label>
        <textarea id="goals" name="goals" required rows={4} className="input" defaultValue={v.goals} />
        <p className="hint">The more specific, the better.</p>
      </div>

      {/* Honeypot for bots — hidden from people and screen readers. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <SubmitButton className="btn btn-accent w-full sm:w-auto" pendingText="Sending…">
        Submit application
      </SubmitButton>
    </form>
  );
}
