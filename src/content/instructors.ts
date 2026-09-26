/**
 * Website copy for "Own the Room", the instructor mentorship course.
 * Student pairing lives inside it (the "Still training" audience).
 *
 * COPY: draft wording and course structure to confirm before launch.
 * The course name is a suggestion; change it here and it updates
 * everywhere on the site and in the dashboard.
 */
import type { Shift } from "./studio";

export const instructorCourse = {
  name: "Own the Room",
  kind: "Mentorship course for Pilates instructors",
};

export const instructorHero = {
  eyebrow: `${instructorCourse.name} · for instructors`,
  lineOne: "Certified isn't the same",
  lineTwo: "as confident.",
  intro: `${instructorCourse.name} is a mentorship course for Pilates instructors who want to walk into every class calm, clear and ready for whoever is on the mat. You're paired with a mentor from the balance team who helps you get better, class by class.`,
};

export const instructorPains = {
  eyebrow: "Be honest",
  title: "The thoughts you don't say out loud.",
  items: [
    "You plan the class the night before, then plan it again at 6am.",
    "Someone mentions their back, and your mind goes quietly blank.",
    "You've said “engage your core” four times. It still isn't landing.",
    "The ten-year regular is in the front row again, and you can feel it.",
    "You notice exactly who doesn't rebook.",
    "Your class is quieter than the one before it, and you've wondered why.",
    "You drive home replaying the one moment you lost the room.",
    "You qualified, and then the feedback stopped.",
  ],
  closing:
    "Every instructor you admire has felt this. The difference is that someone watched them teach and told them the truth, kindly.",
};

export const instructorReframe = {
  eyebrow: "Why mentorship",
  title: "Confidence isn't a personality trait. It's reps, feedback and someone in your corner.",
  body: [
    "Training taught you the repertoire. It couldn't give you thousands of hours in front of real clients, with someone beside you pointing out what's working.",
    "That's what mentorship does. It shortens the distance between the instructor you are and the one you know you could be.",
  ],
};

export const instructorModules = [
  { title: "Find your voice", body: "Cues that land the first time: verbal, visual and hands-on, and knowing when to say less." },
  { title: "Plan less, teach more", body: "Sequencing frameworks so you're never blank, and can change the plan when the room needs it." },
  { title: "Teach every body", body: "Modifications, injuries and complex clients: how to adapt with confidence, and when to refer on." },
  { title: "Read the room", body: "Mixed levels, the experienced regular, low-energy days. Pace and presence that keep everyone with you." },
  { title: "Build your regulars", body: "The small moments that make clients book you by name, and keep coming back." },
  { title: "Grow your career", body: "Getting more classes, auditioning well, and asking for what you're worth." },
];

export const instructorShifts: Shift[] = [
  { from: "Over-planning every class and still feeling unprepared", to: "Frameworks that let you teach what the room needs" },
  { from: "Freezing when a client mentions an injury", to: "Knowing how to adapt, and when to refer on" },
  { from: "Repeating the same cues and hoping", to: "A toolkit of cues for every kind of learner" },
  { from: "Taking every empty spot personally", to: "Regulars who book you by name" },
  { from: "Waiting to be offered more classes", to: "Knowing your value, and asking for it" },
];

export const instructorAudiences = [
  { title: "Newly qualified", body: "You've passed. Now you want to feel like you belong at the front of the room." },
  { title: "Back after a break", body: "Maternity leave, injury or time away. Get your confidence back, quickly." },
  { title: "Experienced but stuck", body: "Years in, teaching the same class on repeat. Find your spark again." },
  { title: "Still training", body: "Studying with balance education or elsewhere? Get paired with a mentor while you learn." },
];

export const instructorSteps = [
  { title: "Apply", body: "Tell us where you are and what knocks your confidence. It takes about ten minutes." },
  { title: "Get matched", body: "We pair you with a mentor from the balance team who fits what you teach and what you want to work on." },
  { title: "Sessions & feedback", body: "One-to-one video sessions built around your real classes: what happened, what worked, what to try next." },
  { title: "See your progress", body: "Goals and session notes in your own dashboard, so you can see how far you've come." },
];

export const instructorIncluded = [
  "A mentor from the balance team, matched to you",
  "One-to-one sessions on Google Meet",
  "Notes and action points after every session",
  "Goals and progress in your own dashboard",
  `The six ${instructorCourse.name} focus areas, tailored to you`,
];

export const instructorFaqs = [
  {
    q: "Do I need to have trained with balance?",
    a: `No. ${instructorCourse.name} is open to instructors from any training background.`,
  },
  {
    q: "I'm still training. Can I join?",
    a: "Yes. Students can join and be paired with a mentor while they study, so you start teaching with support already in place.",
  },
  {
    q: "Will the studio I teach at find out?",
    a: "Only if you tell them. What you share with your mentor stays between you.",
  },
  {
    q: "Is it online?",
    a: "Yes. Sessions are on Google Meet, so you can join from anywhere in Ireland.",
  },
  {
    q: "How much time does it take?",
    a: "Sessions are booked around your teaching. Each one ends with one or two things to try in your next class, not homework.",
  },
  {
    q: "What happens after I apply?",
    a: "We read every application personally and reply within a week. If it's a good fit, you'll get a link to confirm your place.",
  },
];

export const instructorFinalCta = {
  title: "Walk into your next class like you belong there.",
  body: "Because you do. Let's make it feel that way.",
};

export const instructorTeaser = {
  eyebrow: "For instructors",
  title: "Certified isn't the same as confident.",
  body: `${instructorCourse.name} is our mentorship course for Pilates instructors who want to teach with calm, clear confidence, paired with a mentor from the balance team. Still training? You can join too.`,
};

export const INSTRUCTOR_STAGES = [
  "Still training",
  "Qualified less than a year",
  "Qualified 1–3 years",
  "Qualified 3+ years",
  "Returning after a break",
];

export const DISCIPLINES = ["Mat", "Reformer", "Mat & Reformer", "Other apparatus"];
