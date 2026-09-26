/**
 * Demo data for local development. Refuses to run against a non-local
 * database so the demo passwords never reach production.
 *
 * Local logins (all use the password in DEMO_PASSWORD below):
 *   admin@example.com    — admin
 *   kelly@example.com    — mentor (studio mentorship)
 *   maya@example.com     — mentor (student pairing)
 *   sam@example.com      — mentee (active, matched with Maya)
 */
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { randomBytes } from "node:crypto";

const DEMO_PASSWORD = "mentorship-demo";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  console.error("Refusing to seed: DATABASE_URL is not a local database.");
  process.exit(1);
}

const prisma = new PrismaClient();
const day = 86_400_000;
const token = () => randomBytes(24).toString("base64url");

async function main() {
  // Wipe in dependency order so the seed is re-runnable.
  await prisma.authToken.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcryptjs.hash(DEMO_PASSWORD, 10);
  const now = Date.now();

  await prisma.user.create({ data: { name: "Alex Admin", email: "admin@example.com", role: "ADMIN", passwordHash } });
  await prisma.user.create({
    data: {
      name: "Kelly O'Neill",
      email: "kelly@example.com",
      role: "MENTOR",
      passwordHash,
      headline: "Founder, balance studios",
      bio: "Kelly built balance into Ireland's fastest-growing Pilates studio and now mentors studio owners one-to-one.",
    },
  });
  const maya = await prisma.user.create({
    data: {
      name: "Maya Okafor",
      email: "maya@example.com",
      role: "MENTOR",
      passwordHash,
      headline: "Engineering manager · 12 years building product teams",
      bio: "I've led teams at two scale-ups and love helping people make the jump from strong individual contributor to leader.",
    },
  });
  await prisma.user.create({
    data: {
      name: "Daniel Reyes",
      email: "daniel@example.com",
      role: "MENTOR",
      passwordHash,
      headline: "Design director · ex-agency, now in-house",
    },
  });

  const current = await prisma.cohort.create({
    data: {
      name: "Student pairing — Autumn 2026",
      description: "Our pilot cohort.",
      startDate: new Date(now - 14 * day),
      endDate: new Date(now + 70 * day),
      priceCents: 45000,
      capacity: 10,
      isOpen: false,
    },
  });
  const next = await prisma.cohort.create({
    data: {
      name: "Student pairing — Spring 2027",
      description: "Twelve weeks, six one-to-one sessions, and a goal plan you build with your mentor.",
      startDate: new Date(now + 120 * day),
      endDate: new Date(now + 204 * day),
      priceCents: 49500,
      capacity: 12,
    },
  });

  const studio = await prisma.cohort.create({
    data: {
      name: "Studio mentorship — 2027 intake",
      track: "STUDIO",
      description: "A studio deep-dive with Kelly, a tailored plan, and monthly one-to-one sessions for six months.",
      startDate: new Date(now + 45 * day),
      endDate: new Date(now + 225 * day),
      priceCents: 180000,
      capacity: 6,
    },
  });
  await prisma.application.create({
    data: {
      name: "Aoife Brennan",
      email: "aoife.studio@example.com",
      cohortId: studio.id,
      currentRole: "Owner and lead instructor",
      studioName: "Core & Co Pilates",
      studioLocation: "Galway",
      studioStage: "Open 1–3 years",
      background: "Eight reformers, three part-time instructors, about 60 classes a week. Mornings are full but evenings are half empty.",
      goals: "Fix the evening timetable, stop teaching 25 classes a week myself, and decide whether to open a second room.",
      linkedinUrl: "https://instagram.com/example",
    },
  });

  // Active mentee with a mentor, goals and sessions.
  const sam = await prisma.user.create({ data: { name: "Sam Byrne", email: "sam@example.com", role: "MENTEE", passwordHash } });
  const samApp = await prisma.application.create({
    data: {
      name: sam.name,
      email: sam.email,
      cohortId: current.id,
      currentRole: "Senior developer at a logistics company",
      background: "Six years as a backend developer. Recently started leading a small squad informally.",
      goals: "Get comfortable leading people, and figure out whether management is the right path for me.",
      status: "ACCEPTED",
      reviewedAt: new Date(now - 30 * day),
    },
  });
  const samEnrollment = await prisma.enrollment.create({
    data: {
      applicationId: samApp.id,
      cohortId: current.id,
      menteeId: sam.id,
      mentorId: maya.id,
      status: "ACTIVE",
      paymentToken: token(),
      amountCents: current.priceCents,
      currency: current.currency,
      paidAt: new Date(now - 25 * day),
    },
  });
  await prisma.goal.createMany({
    data: [
      { enrollmentId: samEnrollment.id, title: "Run weekly 1:1s with my two juniors", status: "IN_PROGRESS" },
      { enrollmentId: samEnrollment.id, title: "Lead the Q4 planning session", status: "NOT_STARTED", dueDate: new Date(now + 30 * day) },
      { enrollmentId: samEnrollment.id, title: "Write down my own career goals", status: "DONE" },
    ],
  });
  await prisma.meeting.createMany({
    data: [
      {
        enrollmentId: samEnrollment.id,
        scheduledAt: new Date(now - 10 * day),
        status: "COMPLETED",
        location: "https://meet.google.com/abc-defg-hij",
        agenda: "Kick-off: expectations and goals",
        notes: "Great first session. Agreed three goals. Action: draft your 1:1 template before next time.",
        createdById: maya.id,
      },
      {
        enrollmentId: samEnrollment.id,
        scheduledAt: new Date(now + 4 * day),
        location: "https://meet.google.com/abc-defg-hij",
        agenda: "Review 1:1 template; prep for planning session",
        createdById: maya.id,
      },
    ],
  });

  // Paid but not yet matched.
  const priyaApp = await prisma.application.create({
    data: {
      name: "Priya Nair",
      email: "priya@example.com",
      cohortId: current.id,
      currentRole: "Product manager",
      background: "Moved from consulting into product two years ago.",
      goals: "Build confidence presenting to leadership and shaping strategy.",
      status: "ACCEPTED",
    },
  });
  const priya = await prisma.user.create({ data: { name: priyaApp.name, email: priyaApp.email, role: "MENTEE", passwordHash } });
  await prisma.enrollment.create({
    data: {
      applicationId: priyaApp.id,
      cohortId: current.id,
      menteeId: priya.id,
      status: "ACTIVE",
      paymentToken: token(),
      amountCents: current.priceCents,
      currency: current.currency,
      paidAt: new Date(now - 3 * day),
    },
  });

  // Pending applications for the next cohort.
  await prisma.application.createMany({
    data: [
      {
        name: "Jordan Kelly",
        email: "jordan@example.com",
        cohortId: next.id,
        currentRole: "UX designer",
        background: "Four years in agency design, now moving in-house.",
        goals: "Learn how to influence product decisions, not just execute them.",
        linkedinUrl: "https://linkedin.com/in/example",
      },
      {
        name: "Chris O'Neill",
        email: "chris@example.com",
        cohortId: next.id,
        currentRole: "Data analyst",
        background: "Self-taught analyst, three years at a retailer.",
        goals: "Move into data science and get feedback on a portfolio project.",
      },
    ],
  });

  console.log(`Seeded. Log in with admin@ / kelly@ / maya@ / sam@example.com — password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
