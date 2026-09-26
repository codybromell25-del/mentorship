/**
 * Which optional parts of the app are switched on for this deployment.
 * A fresh Vercel deployment with no environment variables still serves
 * the full marketing site; accounts, applications and email switch on
 * as their settings are added (see README, "Deploy to Vercel").
 */

/** Database plus auth secret: logins, dashboards, admin, applications. */
export function accountsEnabled(): boolean {
  return !!process.env.DATABASE_URL && !!process.env.AUTH_SECRET;
}

/** Real email sending (otherwise emails are written to the server log). */
export function emailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Search engines are kept out until the copy is approved: set
 * ALLOW_INDEXING=true (and redeploy) to let Google in.
 */
export function indexingAllowed(): boolean {
  return process.env.ALLOW_INDEXING === "true";
}
