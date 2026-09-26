"use client";

import { useActionState } from "react";
import { submitSoftwareEnquiry, type EnquiryState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/ui";

export function EnquiryForm({ tools, preselect }: { tools: { key: string; name: string; status: string }[]; preselect?: string }) {
  const [state, action] = useActionState<EnquiryState, FormData>(submitSoftwareEnquiry, null);
  const v = state?.values ?? {};

  return (
    <form action={action} className="card space-y-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" required className="input" defaultValue={v.name} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" defaultValue={v.email} autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="studioName">Studio name</label>
          <input id="studioName" name="studioName" required className="input" defaultValue={v.studioName} />
        </div>
        <div>
          <label className="label" htmlFor="studioLocation">Location <span className="font-normal text-muted">(optional)</span></label>
          <input id="studioLocation" name="studioLocation" className="input" defaultValue={v.studioLocation} />
        </div>
      </div>
      <div className="max-w-sm">
        <label className="label" htmlFor="bookingSystem">Booking system</label>
        <input id="bookingSystem" name="bookingSystem" list="booking-systems" className="input" placeholder="e.g. Momence" defaultValue={v.bookingSystem} />
        <datalist id="booking-systems">
          {["Momence", "Mindbody", "Glofox", "Arketa", "Mariana Tek", "Other"].map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <p className="hint">Studio reporting currently works with Momence.</p>
      </div>
      <fieldset>
        <legend className="label">Which tools are you interested in?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {tools.map((t) => (
            <label key={t.key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm text-ink">
              <input type="checkbox" name="tools" value={t.key} defaultChecked={t.key === preselect} className="h-4 w-4 accent-[var(--accent)]" />
              <span className="flex-1">{t.name}</span>
              {t.status === "Coming soon" && <span className="text-[10px] tracking-wide text-muted uppercase">Soon</span>}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="message">Anything else? <span className="font-normal text-muted">(optional)</span></label>
        <textarea id="message" name="message" rows={3} className="input" placeholder="Number of locations, instructors, what you use today…" defaultValue={v.message} />
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <SubmitButton className="btn btn-accent" pendingText="Sending…">Send enquiry</SubmitButton>
    </form>
  );
}
