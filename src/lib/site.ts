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
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
