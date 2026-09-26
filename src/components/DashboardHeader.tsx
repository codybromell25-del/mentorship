/** Greeting header shared by the mentee and mentor dashboards. */
export function DashboardHeader({ eyebrow, name, subtitle, children }: { eyebrow: string; name: string; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-4xl text-ink">Hi, {name.split(" ")[0]}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
