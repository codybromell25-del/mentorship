# balance mentorship

Two paid 1:1 programmes from balance studios, each with its own intakes:

- **Studio mentorship** (the headline offer): Kelly O'Neill works one-to-one
  with Pilates studio owners, case by case, to steady, grow and run their studio.
- **Student pairing**: students are matched with a mentor from the balance team.

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

1. Someone applies at `/apply?track=studio` or `/apply?track=student` for an open intake
   (intakes are created per programme at `/admin/cohorts`).
2. An admin accepts at `/admin/applications`, which emails them a payment link.
3. They pay via Stripe; the webhook creates their account and emails a set-password link.
4. The admin assigns a mentor at `/admin/enrollments` (Kelly for studio owners).
5. The mentor books sessions, records notes, and tracks goals with the mentee.

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
