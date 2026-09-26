import { scheduleMeeting } from "@/lib/actions/mentorship";
import { ActionForm } from "@/components/ActionForm";
import { site } from "@/lib/site";

/**
 * Book a session. Pass `enrollmentId` on a mentee's page, or `mentees`
 * to show a picker (the mentor schedule page).
 */
export function ScheduleMeetingForm({
  enrollmentId,
  mentees,
  defaultDurationMin = 45,
  googleConnected,
}: {
  enrollmentId?: string;
  mentees?: { enrollmentId: string; name: string }[];
  defaultDurationMin?: number;
  googleConnected: boolean;
}) {
  return (
    <section className="card">
      <h2 className="mb-1 text-xl text-ink">Book a session</h2>
      <p className="mb-5 text-sm text-muted">
        Times are in {site.timeZone}.{" "}
        {googleConnected
          ? "A Google Meet link is created and your mentee gets a calendar invite."
          : "Your mentee gets an email. Connect Google Calendar in Settings to create Meet links automatically."}
      </p>
      <ActionForm action={scheduleMeeting.bind(null, enrollmentId ?? null)} submitLabel="Book session" pendingText="Booking…" resetOnSuccess>
        {mentees && (
          <div>
            <label className="label" htmlFor="enrollmentId">With</label>
            <select id="enrollmentId" name="enrollmentId" required className="input" defaultValue="">
              <option value="" disabled>Choose a mentee</option>
              {mentees.map((m) => (
                <option key={m.enrollmentId} value={m.enrollmentId}>{m.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-3">
          <div>
            <label className="label" htmlFor="scheduledAt">Date & time</label>
            <input id="scheduledAt" name="scheduledAt" type="datetime-local" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="durationMin">Minutes</label>
            <input id="durationMin" name="durationMin" type="number" min={15} max={240} step={15} defaultValue={defaultDurationMin} className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">
            Video link <span className="font-normal text-muted">({googleConnected ? "leave blank for a new Google Meet" : "leave blank to use your saved link"})</span>
          </label>
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
