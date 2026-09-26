import Image from "next/image";
import type { Meeting } from "@prisma/client";
import { formatDateTime } from "@/lib/format";
import { site } from "@/lib/site";
import { Countdown } from "./Countdown";
import { isUrl, joinLabel } from "./links";

/**
 * The call-centre hero shared by the mentee and mentor dashboards: the
 * next session, a live countdown and a one-click Join button.
 * (Google Meet can't be embedded in another site, so Join opens a tab.)
 */
export function NextSessionCard({
  meeting,
  withName,
  emptyText,
  children,
}: {
  meeting: Pick<Meeting, "id" | "scheduledAt" | "durationMin" | "location" | "agenda"> | null;
  withName?: string | null;
  emptyText: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-accent text-white">
      <Image src="/images/studio-wide.jpg" alt="" fill className="-z-10 object-cover opacity-25" sizes="(min-width: 1024px) 1100px, 100vw" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent via-accent/90 to-accent/60" />
      <div className="flex flex-wrap items-end justify-between gap-6 p-6 md:p-8">
        <div className="min-w-0">
          <p className="mb-3 text-xs tracking-[0.3em] text-accent-soft uppercase">Next session</p>
          {meeting ? (
            <>
              <h2 className="text-3xl text-white md:text-4xl">{formatDateTime(meeting.scheduledAt)}</h2>
              <p className="mt-2 text-sm text-white/75">
                {meeting.durationMin} min{withName ? ` with ${withName}` : ""} · {site.timeZone}
              </p>
              {meeting.agenda && <p className="mt-3 max-w-xl text-sm whitespace-pre-line text-white/85">{meeting.agenda}</p>}
              <div className="mt-4">
                <Countdown at={meeting.scheduledAt.toISOString()} durationMin={meeting.durationMin} />
              </div>
            </>
          ) : (
            <h2 className="text-2xl text-white">{emptyText}</h2>
          )}
        </div>
        {meeting && (
          <div className="flex flex-wrap gap-3">
            {isUrl(meeting.location) ? (
              <a href={meeting.location} target="_blank" rel="noreferrer" className="btn bg-gold text-ink hover:bg-gold-soft">
                {joinLabel(meeting.location)}
              </a>
            ) : (
              <span className="rounded-full border border-white/30 px-5 py-3 text-xs tracking-[0.15em] text-white/80 uppercase">
                {meeting.location ?? "Video link to follow"}
              </span>
            )}
            <a href={`/api/meetings/${meeting.id}/ics`} className="btn border border-white/40 text-white hover:bg-white/10">
              Add to calendar
            </a>
          </div>
        )}
      </div>
      {children && <div className="border-t border-white/15 bg-black/10 px-6 py-4 md:px-8">{children}</div>}
    </section>
  );
}
