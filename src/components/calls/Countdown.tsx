"use client";

import { useEffect, useState } from "react";

/** "Live now" / "Starts in 12 min" / "In 3 days", refreshed every 30s. */
export function Countdown({ at, durationMin }: { at: string; durationMin: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const start = Date.parse(at);
  const end = start + durationMin * 60_000;
  const mins = Math.round((start - now) / 60_000);

  let label: string;
  let live = false;
  if (now >= end) label = "Finished";
  else if (now >= start - 10 * 60_000) {
    live = true;
    label = now >= start ? "Live now" : `Starts in ${Math.max(mins, 1)} min`;
  } else if (mins < 60) label = `Starts in ${mins} min`;
  else if (mins < 24 * 60) label = `Starts in ${Math.round(mins / 60)} h`;
  else label = `In ${Math.round(mins / (24 * 60))} days`;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] tracking-[0.15em] uppercase ${
        live ? "bg-gold text-ink" : "bg-white/15 text-white"
      }`}
    >
      {live && <span className="h-2 w-2 animate-pulse rounded-full bg-ink" aria-hidden />}
      {label}
    </span>
  );
}
