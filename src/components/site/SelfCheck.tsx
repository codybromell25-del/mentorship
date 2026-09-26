"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CheckConfig } from "@/content/checks";

/**
 * One-question-at-a-time self-assessment. Everything happens in the
 * browser; answers are never sent or stored.
 */
export function SelfCheck({
  config,
  primary,
  secondary,
}: {
  config: CheckConfig;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  const { questions } = config;
  const [answers, setAnswers] = useState<number[]>([]);
  const step = answers.length;
  const done = step >= questions.length;
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new question (or result) for keyboard and screen-reader users.
  useEffect(() => {
    if (answers.length > 0) headingRef.current?.focus();
  }, [answers.length]);

  if (done) {
    const total = answers.reduce((a, b) => a + b, 0);
    const max = questions.length * 3;
    const band = config.bands.find((b) => total >= b.min) ?? config.bands[config.bands.length - 1];

    // Average score per area; the two weakest become the focus tips.
    const byArea = new Map<string, number[]>();
    questions.forEach((q, i) => byArea.set(q.area, [...(byArea.get(q.area) ?? []), answers[i]]));
    const focus = [...byArea]
      .map(([area, scores]) => ({ area, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 2)
      .filter((f) => f.avg < 3)
      .map((f) => config.areas[f.area]);

    return (
      <div aria-live="polite">
        <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-center">
          <ScoreRing score={total} max={max} />
          <div>
            <p className="text-xs tracking-[0.3em] text-accent uppercase">Your result</p>
            <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-4xl text-ink outline-none md:text-5xl">{band.title}</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{band.body}</p>
          </div>
        </div>

        {focus.length > 0 && (
          <div className="mt-14">
            <h3 className="text-2xl text-ink">Where to focus first</h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {focus.map((a) => (
                <div key={a.title} className="rounded-3xl border border-border bg-surface p-7">
                  <p className="font-heading text-xl text-ink italic">{a.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{a.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 rounded-3xl bg-ink p-8 text-white md:p-10">
          <p className="font-heading text-2xl italic md:text-3xl">Want someone to work through this with you?</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={primary.href} className="btn btn-gold">{primary.label}</Link>
            {secondary && (
              <Link href={secondary.href} className="text-sm text-white/80 underline underline-offset-4 hover:text-white">{secondary.label}</Link>
            )}
          </div>
        </div>

        <button type="button" onClick={() => setAnswers([])} className="mt-8 text-sm text-muted underline underline-offset-4 hover:text-ink">
          Start again
        </button>
      </div>
    );
  }

  const q = questions[step];
  return (
    <div>
      <div className="flex items-center justify-between text-xs tracking-[0.2em] text-muted uppercase">
        <span>
          Question {step + 1} of {questions.length}
        </span>
        {step > 0 && (
          <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} className="tracking-normal normal-case underline underline-offset-4 hover:text-ink">
            ← Back
          </button>
        )}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(step / questions.length) * 100}%` }} />
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="mt-10 text-3xl leading-tight text-ink outline-none md:text-4xl" aria-live="polite">
        {q.prompt}
      </h2>
      <div className="mt-8 grid gap-3">
        {q.options.map((label, points) => (
          <button
            key={label}
            type="button"
            onClick={() => setAnswers([...answers, points])}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-6 py-5 text-left text-ink transition-colors hover:border-accent hover:bg-accent/5 focus-visible:border-accent"
          >
            <span>{label}</span>
            <span aria-hidden className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">→</span>
          </button>
        ))}
      </div>
      <p className="mt-8 text-xs text-muted">Your answers stay in your browser. Nothing is saved or sent.</p>
    </div>
  );
}

function ScoreRing({ score, max }: { score: number; max: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 128 128" className="h-40 w-40 -rotate-90" aria-hidden>
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--surface-muted)" strokeWidth="8" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / max)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-4xl text-ink">{score}</span>
        <span className="text-xs text-muted">out of {max}</span>
      </div>
    </div>
  );
}
