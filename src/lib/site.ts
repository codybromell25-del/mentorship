/**
 * Programme branding in one place. Rename the programme here and every
 * page, email and Stripe line item picks it up.
 */
export const site = {
  name: "Mentorship",
  tagline: "A 12-week, one-to-one mentorship programme",
  description:
    "Get paired with an experienced mentor for twelve weeks of focused one-to-one sessions, clear goals, and honest feedback.",
  contactEmail: "hello@example.com",
  // All meeting times are entered and shown in this zone.
  timeZone: "Europe/Dublin",
};

export function appUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
