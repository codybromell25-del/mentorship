<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project notes

Paid 1:1 mentorship programme. Flow: public `/apply` → admin accepts in
`/admin/applications` (creates an `Enrollment` + emails a `/pay/[token]`
link) → Stripe Checkout → webhook `activateEnrollment()` creates the
mentee `User` and emails an account-setup link → admin assigns a mentor →
mentor books sessions and writes notes; mentee and mentor share goals.

- Roles: `MENTEE` → `/dashboard`, `MENTOR` → `/mentor`, `ADMIN` → `/admin`.
  `src/proxy.ts` gates routes; every page/action re-checks with `requireUser()`.
- Mutations are server actions: `src/app/(app)/admin/actions.ts` and
  `src/lib/actions/mentorship.ts`. Forms use `<ActionForm>`.
- Emails are templates in `src/lib/emails/index.ts`; without
  `RESEND_API_KEY` they print to the dev-server console.
- Meeting times are entered/shown in `site.timeZone` (`src/lib/site.ts`).
- Without Stripe keys in development, `/pay/[token]` offers "Simulate payment".
