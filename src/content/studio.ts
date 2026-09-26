/**
 * Website copy for studio mentorship with Kelly (the homepage).
 *
 * COPY: every line here is a draft for Kelly to confirm, especially
 * `kellyNote`, which is written in her voice.
 */

export type Shift = { from: string; to: string };

export const studioHero = {
  eyebrow: "Studio mentorship with Kelly O'Neill",
  lineOne: "You opened a studio to teach Pilates.",
  lineTwo: "Not to lie awake doing the maths.",
  intro:
    "One-to-one mentorship from the founder of balance, Ireland's fastest-growing Pilates studio. Kelly looks at your studio case by case and helps you steady it, grow it and run it, so it stops running you.",
};

export const studioPains = {
  eyebrow: "Sound familiar?",
  title: "The side of studio ownership nobody posts about.",
  items: [
    "You check the bookings before you've had your coffee.",
    "Tuesday's 7pm has a waitlist. Thursday's has three people. You're not sure why.",
    "You've taught more cover classes this month than you'd like to admit.",
    "You know your prices are too low. Raising them feels like a risk you can't afford.",
    "A new studio opened nearby, and you've been quietly counting cancellations ever since.",
    "Revenue looks fine on paper. The bank balance tells a different story.",
    "You can't remember the last class you took just for you.",
    "Everyone says the studio looks amazing. Nobody asks how you are.",
  ],
  closing:
    "None of this means you're bad at running a studio. It means you've been doing it on your own, without anyone who has done it before.",
};

export const studioReframe = {
  eyebrow: "Meet your mentor",
  title: "You're an exceptional teacher. Nobody showed you how to be the boss.",
  body: [
    "Most studio owners got into this because they love Pilates, not rotas, pricing and payroll. You trained for hundreds of hours to teach. Nobody gave you the same training for running the business.",
    "That isn't a weakness. It's a gap, and it's the easiest kind to close with someone who has already been where you are.",
  ],
};

export const kellyNote = {
  paragraphs: [
    "I've had the 6am cover calls, the half-empty evening class and the month where the numbers just didn't add up. Building balance taught me that most studio problems aren't Pilates problems. They're pricing, timetable and people problems, and every one of them can be fixed.",
    "When we work together, I look at your studio the way I look at my own: the numbers, the timetable, the team and how it feels to walk in the door. Then we fix things in the right order, one at a time, until the studio works for you instead of the other way round.",
  ],
  name: "Kelly O'Neill",
  role: "Founder, balance studios · Course director, balance education",
};

export const studioPillars: { title: string; image: string; lead: string; shifts: Shift[] }[] = [
  {
    title: "Steady",
    image: "/images/studio-welcome.jpg",
    lead: "Get the foundations right, so the studio stops feeling fragile.",
    shifts: [
      { from: "Finding out how the month went when the bank tells you", to: "Knowing your numbers every week, and what to do about them" },
      { from: "Prices set by guesswork and nerves", to: "Prices that reflect what your studio is worth" },
    ],
  },
  {
    title: "Grow",
    image: "/images/studio-wide.jpg",
    lead: "Fill the classes you already have before you add more.",
    shifts: [
      { from: "Half-empty classes you keep running out of habit", to: "A timetable built on what actually fills" },
      { from: "Intro offers that never turn into members", to: "A welcome that turns first visits into regulars" },
    ],
  },
  {
    title: "Run",
    image: "/images/instructor-helping.jpg",
    lead: "Build a team and systems that work when you're not in the room.",
    shifts: [
      { from: "One sick instructor derails the whole week", to: "A team and a cover system you trust" },
      { from: "Teaching 20 classes a week and doing admin at midnight", to: "Teaching the classes you love, with your evenings back" },
    ],
  },
];

export const studioSteps = [
  { title: "Apply", body: "Tell us about your studio and what's keeping you up at night. It takes about ten minutes." },
  { title: "Studio deep-dive", body: "Kelly studies your studio case by case: numbers, timetable, team, pricing and client experience." },
  { title: "Your plan", body: "Clear, prioritised advice for your studio, starting with what will make the biggest difference soonest." },
  { title: "One-to-one sessions", body: "Regular video sessions with Kelly to work through the plan, adjust it, and handle whatever comes up." },
];

export const studioIncluded = [
  "A full studio deep-dive with Kelly",
  "A prioritised plan, tracked as goals in your dashboard",
  "One-to-one sessions on Google Meet",
  "Notes and action points after every session",
  "All online, wherever your studio is in Ireland",
];

export const studioFaqs = [
  {
    q: "I'm already stretched. How much time does this take?",
    a: "Sessions are booked around your timetable and held online, so there's no travel. Each one ends with two or three clear actions, not a list you'll never get through.",
  },
  {
    q: "My studio is small. Is this for me?",
    a: "Yes. Small studios have the least room for guesswork, which is exactly why getting the foundations right matters. Mentorship is for studios at every stage, from pre-opening to multiple sites.",
  },
  {
    q: "Will you try to turn my studio into a copy of balance?",
    a: "No. The aim is to make your studio stronger on its own terms: your brand, your clients, your way of teaching.",
  },
  {
    q: "Is what I share confidential?",
    a: "Yes. Your numbers and your challenges stay between you and Kelly.",
  },
  {
    q: "Do I need to be near one of the balance studios?",
    a: "No. Sessions are online, so it works wherever your studio is in Ireland.",
  },
  {
    q: "What happens after I apply?",
    a: "We read every application personally and reply within a week. If it's a good fit, you'll get a link to confirm your place.",
  },
  {
    q: "What is balanceHQ?",
    a: "The software balance runs on. It's sold separately, so you can use it with or without mentorship.",
  },
];

export const studioFinalCta = {
  title: "Get your evenings back.",
  body: "The studio you opened was meant to feel like this: busy classes, a team you trust, and time to breathe. Let's get it there.",
};

export const hqTeaser = {
  eyebrow: "balanceHQ · sold separately",
  title: "Stop running your studio on gut feel.",
  body: "The software that runs balance, now available to studios across Ireland. See what's working, what isn't, and what to do next.",
  questions: [
    "Which of your classes actually make money?",
    "How many intro offers became members last month?",
    "Is this month really better than last?",
  ],
};
