/**
 * Demo data for local development. Refuses to run against a non-local
 * database so the demo passwords never reach production.
 *
 * Local logins (all use the password in DEMO_PASSWORD below):
 *   admin@example.com    — admin
 *   kelly@example.com    — mentor (studio mentorship)
 *   maya@example.com     — mentor (Own the Room, instructors)
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
  await prisma.googleAccount.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcryptjs.hash(DEMO_PASSWORD, 10);
  const now = Date.now();

  await prisma.user.create({ data: { name: "Alex Admin", email: "admin@example.com", role: "ADMIN", passwordHash } });
  const kelly = await prisma.user.create({
    data: {
      name: "Kelly O'Neill",
      meetingLink: "https://meet.google.com/abc-defg-hij",
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
      headline: "Senior reformer instructor & educator, balance",
      bio: "Ten years teaching reformer and mat. I love helping new instructors find their voice and stop over-planning.",
    },
  });
  await prisma.user.create({
    data: {
      name: "Daniel Reyes",
      email: "daniel@example.com",
      role: "MENTOR",
      passwordHash,
      headline: "Mat specialist & studio manager",
    },
  });

  const current = await prisma.cohort.create({
    data: {
      name: "Own the Room — Autumn 2026",
      track: "INSTRUCTOR",
      description: "Our pilot intake.",
      startDate: new Date(now - 14 * day),
      endDate: new Date(now + 70 * day),
      priceCents: 45000,
      capacity: 10,
      isOpen: false,
    },
  });
  const next = await prisma.cohort.create({
    data: {
      name: "Own the Room — Spring 2027",
      track: "INSTRUCTOR",
      description: "Twelve weeks with a mentor from the balance team: one-to-one sessions, feedback on your real classes, and goals you track together.",
      startDate: new Date(now + 120 * day),
      endDate: new Date(now + 204 * day),
      priceCents: 49500,
      capacity: 12,
    },
  });

  const studio = await prisma.cohort.create({
    data: {
      name: "Studio mentorship — November intake",
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

  // Studio owner already working with Kelly.
  const niamh = await prisma.user.create({ data: { name: "Niamh Walsh", email: "niamh@example.com", role: "MENTEE", passwordHash } });
  const niamhApp = await prisma.application.create({
    data: {
      name: niamh.name,
      email: niamh.email,
      cohortId: studio.id,
      currentRole: "Owner",
      studioName: "Shore Pilates",
      studioLocation: "Wexford",
      studioStage: "Open less than 1 year",
      background: "Opened in March with six reformers. Classes are about 60% full.",
      goals: "Get to break-even, set up memberships, and hire my first instructor.",
      status: "ACCEPTED",
    },
  });
  const niamhEnrollment = await prisma.enrollment.create({
    data: {
      applicationId: niamhApp.id,
      cohortId: studio.id,
      menteeId: niamh.id,
      mentorId: kelly.id,
      status: "ACTIVE",
      paymentToken: token(),
      amountCents: studio.priceCents,
      currency: studio.currency,
      paidAt: new Date(now - 20 * day),
    },
  });
  await prisma.goal.createMany({
    data: [
      { enrollmentId: niamhEnrollment.id, title: "Launch a monthly membership", status: "IN_PROGRESS" },
      { enrollmentId: niamhEnrollment.id, title: "Hire a part-time instructor", status: "NOT_STARTED" },
    ],
  });
  await prisma.meeting.createMany({
    data: [
      {
        enrollmentId: niamhEnrollment.id,
        scheduledAt: new Date(now - 7 * day),
        status: "COMPLETED",
        location: kelly.meetingLink,
        agenda: "Studio deep-dive",
        notes: "Went through the numbers. Evening classes are underpriced relative to demand. Action: draft two membership tiers.",
        createdById: kelly.id,
      },
      {
        enrollmentId: niamhEnrollment.id,
        scheduledAt: new Date(now + 2 * day),
        location: kelly.meetingLink,
        agenda: "Review membership tiers and pricing",
        createdById: kelly.id,
      },
    ],
  });

  // Active mentee with a mentor, goals and sessions.
  const sam = await prisma.user.create({ data: { name: "Sam Byrne", email: "sam@example.com", role: "MENTEE", passwordHash } });
  const samApp = await prisma.application.create({
    data: {
      name: sam.name,
      email: sam.email,
      cohortId: current.id,
      currentRole: "Four reformer classes a week in Dublin",
      instructorStage: "Qualified less than a year",
      disciplines: "Reformer",
      background: "Qualified in the spring. Teaching early mornings and one Saturday class at a busy studio.",
      goals: "I freeze when clients mention injuries, and my classes are quieter than the other instructors'. I over-plan everything.",
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
      { enrollmentId: samEnrollment.id, title: "Teach from a five-block framework instead of a full script", status: "IN_PROGRESS" },
      { enrollmentId: samEnrollment.id, title: "Build a go-to list of modifications for backs and knees", status: "NOT_STARTED", dueDate: new Date(now + 30 * day) },
      { enrollmentId: samEnrollment.id, title: "Learn every client's name in my Saturday class", status: "DONE" },
    ],
  });
  await prisma.meeting.createMany({
    data: [
      {
        enrollmentId: samEnrollment.id,
        scheduledAt: new Date(now - 10 * day),
        status: "COMPLETED",
        location: "https://meet.google.com/abc-defg-hij",
        agenda: "Kick-off: what knocks your confidence, and three goals",
        notes: "Great first session. Agreed three goals. Action: plan Saturday's class as five blocks with two options each, and notice when you switch.",
        createdById: maya.id,
      },
      {
        enrollmentId: samEnrollment.id,
        scheduledAt: new Date(now + 4 * day),
        location: "https://meet.google.com/abc-defg-hij",
        agenda: "Review Saturday's class; cueing for the roll-down",
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
      currentRole: "Two mat classes a week in Limerick",
      instructorStage: "Returning after a break",
      disciplines: "Mat",
      background: "Taught for four years, then took a year off for maternity leave.",
      goals: "Getting my confidence back in front of a full room, and handling postnatal clients well.",
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
        currentRole: "Covering classes while I finish my training",
        instructorStage: "Still training",
        disciplines: "Mat & Reformer",
        background: "In the final module of the balance education course.",
        goals: "I blank on sequences when I'm nervous, and I'm scared of the experienced regulars.",
        linkedinUrl: "https://instagram.com/example",
      },
      {
        name: "Chris O'Neill",
        email: "chris@example.com",
        cohortId: next.id,
        currentRole: "Ten classes a week across two studios in Cork",
        instructorStage: "Qualified 3+ years",
        disciplines: "Reformer",
        background: "Six years teaching. Classes are fine but I feel like I'm teaching the same class on repeat.",
        goals: "Find my spark again, and get the confidence to ask for better pay.",
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
