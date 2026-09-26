import { scheduleMeeting } from "@/lib/actions/mentorship";
import { ActionForm } from "@/components/ActionForm";
import { site } from "@/lib/site";

export function ScheduleMeetingForm({ enrollmentId }: { enrollmentId: string }) {
  return (
    <section className="card">
      <h2 className="mb-1 text-xl text-ink">Book a session</h2>
      <p className="mb-5 text-sm text-muted">Times are in {site.timeZone}. Your mentee gets an email.</p>
      <ActionForm action={scheduleMeeting.bind(null, enrollmentId)} submitLabel="Book session" pendingText="Booking…" resetOnSuccess>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <label className="label" htmlFor="scheduledAt">Date & time</label>
            <input id="scheduledAt" name="scheduledAt" type="datetime-local" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="durationMin">Minutes</label>
            <input id="durationMin" name="durationMin" type="number" min={15} max={240} step={15} defaultValue={45} className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">Video link or place</label>
          <input id="location" name="location" placeholder="https://meet.google.com/…" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="agenda">Agenda <span className="font-normal text-muted">(optional)</span></label>
          <textarea id="agenda" name="agenda" rows={3} className="input" />
        </div>
      </ActionForm>
    </section>
  );
}
