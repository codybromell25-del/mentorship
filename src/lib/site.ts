/**
 * Programme branding in one place. Rename the programme here and every
 * page, email and Stripe line item picks it up.
 */
export const site = {
  name: "balance mentorship",
  tagline: "Ireland's home for Pilates studio owners and instructors",
  description:
    "One-to-one mentorship for Pilates studio owners with Kelly O'Neill, founder of balance, Ireland's fastest-growing Pilates studio. Plus Own the Room, mentorship for instructors, and balanceHQ studio software.",
  contactEmail: "team@balancestudios.ie",
  mentorName: "Kelly O'Neill",
  // All meeting times are entered and shown in this zone.
  timeZone: "Europe/Dublin",
};

export function appUrl(): string {
  // Explicit setting wins; on Vercel fall back to the project's own URL
  // so a fresh deployment works without configuring anything.
  const explicit = process.env.NEXTAUTH_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercelHost =
    process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;
  return "http://localhost:3000";
}
