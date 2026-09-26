import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { googleConfigured } from "@/lib/google";
import { disconnectGoogle, saveMentorSettings } from "@/lib/actions/mentorship";
import { ActionForm } from "@/components/ActionForm";
import { Badge, PageHeader } from "@/components/ui";

export const metadata = { title: "Settings" };

const MESSAGES: Record<string, { tone: "ok" | "error"; text: string }> = {
  connected: { tone: "ok", text: "Google Calendar connected. New sessions will get a Google Meet link automatically." },
  denied: { tone: "error", text: "Google access wasn't granted, so nothing was connected." },
  error: { tone: "error", text: "Something went wrong connecting Google. Please try again." },
  "not-configured": { tone: "error", text: "Google isn't set up on this site yet. An admin needs to add the Google credentials (see README)." },
};

export default async function MentorSettings({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const { google: status } = await searchParams;
  const user = await requireUser(["MENTOR", "ADMIN"]);
  const [me, google] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
    prisma.googleAccount.findUnique({ where: { userId: user.id } }),
  ]);
  const msg = status ? MESSAGES[status] : undefined;

  return (
    <>
      <PageHeader eyebrow="Mentor" title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl text-ink">Google Calendar & Meet</h2>
            {google ? <Badge tone="success">Connected</Badge> : <Badge>Not connected</Badge>}
          </div>
          {msg && (
            <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.tone === "ok" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>{msg.text}</p>
          )}
          {google ? (
            <>
              <p className="text-sm text-muted">
                Sessions you book are added to <span className="text-ink">{google.googleEmail}</span> with a Google Meet link.
                Your mentee gets a calendar invite, and moving or cancelling a session updates it.
              </p>
              <form action={disconnectGoogle} className="mt-5">
                <button className="btn btn-danger btn-sm">Disconnect</button>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">
                Connect once and every session you book gets its own Google Meet link, is added to your calendar, and
                your mentee is sent an invite.
              </p>
              {googleConfigured() ? (
                // Plain link: the OAuth flow is a full-page redirect to Google.
                <a href="/api/google/connect" className="btn btn-primary mt-5">Connect Google Calendar</a>
              ) : (
                <p className="mt-5 rounded-lg bg-surface-muted px-3 py-2 text-xs text-muted">
                  Google isn&apos;t set up on this site yet (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). Until then, save your
                  personal Meet link below and it will be used for every session.
                </p>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="mb-5 text-xl text-ink">Sessions & profile</h2>
          <ActionForm action={saveMentorSettings} submitLabel="Save settings">
            <div>
              <label className="label" htmlFor="meetingLink">Your Google Meet link</label>
              <input id="meetingLink" name="meetingLink" defaultValue={me.meetingLink ?? ""} placeholder="https://meet.google.com/abc-defg-hij" className="input" />
              <p className="hint">Used when Google Calendar isn&apos;t connected, or if creating a Meet link fails.</p>
            </div>
            <div className="max-w-40">
              <label className="label" htmlFor="defaultDurationMin">Default length (min)</label>
              <input id="defaultDurationMin" name="defaultDurationMin" type="number" min={15} max={240} step={15} defaultValue={me.defaultDurationMin} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="headline">Headline shown to mentees</label>
              <input id="headline" name="headline" defaultValue={me.headline ?? ""} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" rows={4} defaultValue={me.bio ?? ""} className="input" />
            </div>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
