/**
 * balanceHQ: balance's studio software, sold separately from mentorship.
 * Reporting is the Momence reporting platform already running at
 * balance (~/Documents/momence-dashboard); the rest are planned.
 * COPY/STATUS: confirm before launch.
 */
export type SoftwareStatus = "In use at balance" | "Coming soon";

export const software: { key: string; name: string; body: string; status: SoftwareStatus }[] = [
  {
    key: "reporting",
    name: "Studio reporting",
    body: "Live KPIs from Momence: bookings, class fill rates, new members, churn, revenue and intro-offer conversion, all on one dashboard.",
    status: "In use at balance",
  },
  {
    key: "instructor-kpis",
    name: "Instructor KPI tracker",
    body: "See each instructor's fill rate, client retention, no-shows and cover given, so reviews and pay rises are based on numbers.",
    status: "Coming soon",
  },
  {
    key: "time-off",
    name: "Time off & cover",
    body: "Holiday requests, approvals and a cover board, so a sick day never means a cancelled class.",
    status: "Coming soon",
  },
  {
    key: "timetable",
    name: "Timetable planner",
    body: "A fill-rate heatmap by day and time that shows which classes to add, move or cut.",
    status: "Coming soon",
  },
  {
    key: "intro-offers",
    name: "Intro offer follow-up",
    body: "Track every trial client and nudge the team to follow up before the offer ends, turning more first visits into members.",
    status: "Coming soon",
  },
  {
    key: "onboarding",
    name: "Instructor onboarding",
    body: "Checklists, studio standards and sign-offs for new instructors, so every class feels like your studio.",
    status: "Coming soon",
  },
];

export const softwareName = (key: string) => software.find((t) => t.key === key)?.name ?? key;
