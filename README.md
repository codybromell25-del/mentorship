# balance mentorship

Ireland's home for Pilates studio owners and instructors. Two paid 1:1
programmes from balance studios, each with its own intakes:

- **Studio mentorship** (the headline offer, homepage `/`): Kelly O'Neill works
  one-to-one with Pilates studio owners, case by case, to steady, grow and run
  their studio.
- **Own the Room** (`/instructors`): a mentorship course for instructors who
  want to teach with confidence, paired with a mentor from the balance team.
  Students still training join here too (this replaced "student pairing").

Free lead-generating self-checks: `/studio-health-check` (owners) and
`/teaching-confidence-check` (instructors). Answers stay in the browser.

**All website copy lives in `src/content/`** (studio, instructors, balancehq,
checks), separate from layout, so it can be reviewed and edited in one place.
Lines marked `COPY:` are drafts to confirm with Kelly.

The landing page also sells **balanceHQ**, balance's studio software, which is
**sold separately** from mentorship. Studios enquire at `/balancehq`; enquiries
land in `/admin/enquiries`. Tools: studio reporting (the Momence reporting platform in
`~/Documents/momence-dashboard`) plus planned tools (instructor KPIs, time off
and cover, timetable planner, intro-offer follow-up, instructor onboarding).
Studio mentorship applicants can also tick "interested in balanceHQ"; those
leads are listed on the enquiries page too. The tool list lives in
`src/lib/software.ts`.

Public site and applications, admin review, Stripe payment, and dashboards for
mentees, mentors and admins. Colours, fonts and imagery match balance education.

Next.js 16 · Tailwind 4 · Prisma + Postgres · NextAuth (credentials) · Stripe · Resend · Vercel

## Run it locally

```bash
npm install
cp .env.example .env            # then set AUTH_SECRET (openssl rand -base64 32)
npm run db:local                # terminal 1: local Postgres on :5433, leave running
npm run db:push && npm run db:seed && npm run dev   # terminal 2
```

Open http://localhost:3000. The seed creates demo logins (see `prisma/seed.ts`):
`admin@example.com`, `kelly@example.com` and `maya@example.com` (mentors), `sam@example.com` (mentee).

Locally, with no Stripe or Resend keys, emails print to the terminal running
`npm run dev`, and payment links show a **Simulate payment** button.

## How the programme works

1. Someone applies at `/apply?track=studio` or `/apply?track=instructor` for an open intake
   (intakes are created per programme at `/admin/cohorts`).
2. An admin accepts at `/admin/applications`, which emails them a payment link.
3. They pay via Stripe; the webhook creates their account and emails a set-password link.
4. The admin assigns a mentor at `/admin/enrollments` (Kelly for studio owners).
5. The mentor books sessions, records notes, and tracks goals with the mentee.

## Video calls (Google Meet)

Mentors manage sessions at `/mentor/schedule` (book, reschedule, cancel,
notes) and connect Google at `/mentor/settings`. With Google connected, each
booking creates a Calendar event with a Meet link and invites the mentee;
moves and cancellations sync. Without it, the mentor's saved Meet link is used
and the app emails the mentee. Google Meet can't be embedded in another site,
so Join opens Meet in a new tab. Both dashboards show the next session with a
live countdown and Join button.

To enable Google: in Google Cloud, enable the Google Calendar API, set up
the OAuth consent screen, create a Web OAuth client with redirect URI
`<NEXTAUTH_URL>/api/google/callback`, then set `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`. While the consent screen is in "Testing", add each
mentor's Google address as a test user.

## Going live

1. Create a Postgres database (Supabase or Neon) and set `DATABASE_URL` / `DIRECT_URL`.
2. Run `npx prisma db push` against it, then create your admin account (for
   example via `npx prisma studio`, then use "Forgot password" to set a password).
3. Deploy on Vercel with every variable from `.env.example`.
4. In Stripe, add a webhook to `https://<your-domain>/api/stripe/webhook` for
   `checkout.session.completed` and `checkout.session.async_payment_succeeded`,
   and set `STRIPE_WEBHOOK_SECRET`.
5. Verify your sending domain in Resend and set `RESEND_API_KEY` and `EMAIL_FROM`.

Rename the programme and set the contact email and timezone in `src/lib/site.ts`.

Landing-page wording marked `COPY:` in `src/app/(public)/page.tsx` is placeholder
text to confirm with Kelly. Photos in `public/images` are web-sized copies of
the balance education site's images.
