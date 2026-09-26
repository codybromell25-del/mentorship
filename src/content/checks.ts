/**
 * The two free self-assessments: the studio health check (owners) and
 * the teaching confidence check (instructors). Scoring is honest: each
 * answer is 0–3, results come in bands, and the two weakest areas get a
 * practical tip whether or not the person goes on to apply.
 *
 * COPY: draft questions, bands and tips to confirm before launch.
 */

export type CheckQuestion = { area: string; prompt: string; options: string[] }; // options ordered 0 → 3 points
export type CheckBand = { min: number; title: string; body: string };
export type CheckArea = { title: string; tip: string };
export type CheckConfig = {
  questions: CheckQuestion[];
  bands: CheckBand[]; // highest `min` first
  areas: Record<string, CheckArea>;
};

export const studioCheck: CheckConfig = {
  questions: [
    {
      area: "numbers",
      prompt: "How do you know if last month was a good month?",
      options: ["I check the bank balance and hope", "I look at revenue in my booking system", "I track revenue, fill rate and retention", "I have a dashboard I review every week"],
    },
    {
      area: "time",
      prompt: "How many classes do you teach yourself each week?",
      options: ["15 or more", "10 to 14", "5 to 9", "Fewer than 5, by choice"],
    },
    {
      area: "pricing",
      prompt: "When did you last raise your prices?",
      options: ["Never, or I can't remember", "More than two years ago", "In the last one to two years", "I review pricing every year"],
    },
    {
      area: "team",
      prompt: "An instructor calls in sick at 6am. What happens?",
      options: ["I teach it, whatever else I had planned", "I ring around until someone says yes", "We work through a cover list", "The team sorts it and I hear afterwards"],
    },
    {
      area: "conversion",
      prompt: "What share of your intro-offer clients become members?",
      options: ["I honestly don't know", "Some do, I think", "I know roughly", "I track it and actively work on it"],
    },
    {
      area: "timetable",
      prompt: "How many of your classes are regularly under half full?",
      options: ["I'm not sure", "Quite a few", "One or two", "None. I move or cut them"],
    },
    {
      area: "time",
      prompt: "When did you last take a week off without checking your phone?",
      options: ["Not since I opened", "More than a year ago", "This year, but I still checked in", "This year, properly off"],
    },
    {
      area: "direction",
      prompt: "Where will your studio be in two years?",
      options: ["Honestly, I'm not sure", "About the same as now", "Bigger, but there's no plan yet", "I have a clear plan"],
    },
  ],
  bands: [
    {
      min: 21,
      title: "Strong foundations",
      body: "You're running a well-organised studio. Mentorship at this stage is about what's next: a second room, a second site, or more time for you.",
    },
    {
      min: 16,
      title: "Solid, with room to grow",
      body: "Your foundations are good. The next step is tightening the areas below, so growth doesn't have to mean more stress.",
    },
    {
      min: 10,
      title: "Holding it together",
      body: "You're keeping everything going, but a lot of it depends on you and on things going right. A few changes, made in the right order, would take real pressure off.",
    },
    {
      min: 0,
      title: "Running on you",
      body: "Right now your studio runs on your hours, your energy and your nerves. That isn't sustainable, and it isn't a reflection of how good you are. The gaps below are the fixable kind.",
    },
  ],
  areas: {
    numbers: {
      title: "Know your numbers",
      tip: "Pick five numbers (revenue, fill rate, new members, cancellations and intro-offer conversion) and look at them every week. The trend matters more than any single month.",
    },
    time: {
      title: "Get yourself off the rota",
      tip: "List every class you teach and mark the ones only you can teach. The rest are your first hiring or cover opportunities.",
    },
    pricing: {
      title: "Price with confidence",
      tip: "Review your prices at least once a year against your costs per class and the studios near you. Explain any change clearly; owners usually fear the reaction far more than it deserves.",
    },
    team: {
      title: "Build a cover system",
      tip: "A shared cover list, a clear sick-day process and a fair cover rate make the 6am call someone else's job, not yours.",
    },
    conversion: {
      title: "Turn first visits into members",
      tip: "Follow up every intro-offer client personally before their offer ends. That one habit is often worth more than any discount.",
    },
    timetable: {
      title: "Fix the timetable",
      tip: "Look at fill rate by class over the last eight weeks. Move or cut the weakest few and give that time to the classes with waitlists.",
    },
    direction: {
      title: "Plan the next two years",
      tip: "Write down what you want the studio to give you in two years (income, time, size) and work backwards. Growth without a plan is just more work.",
    },
  },
};

export const teachingCheck: CheckConfig = {
  questions: [
    {
      area: "planning",
      prompt: "The night before a class, you…",
      options: ["Plan every exercise and still feel unprepared", "Plan in detail and stick to it no matter what", "Have a plan and adapt it to the room", "Have go-to frameworks and build it on the day"],
    },
    {
      area: "clients",
      prompt: "A client arrives with an injury you haven't taught before. You…",
      options: ["Panic inside and hope it doesn't show", "Tell them to skip anything that hurts", "Modify, but I'm not always sure it's right", "Adapt confidently and know when to refer on"],
    },
    {
      area: "cueing",
      prompt: "When a cue isn't landing, you…",
      options: ["Say it again, a bit louder", "Move on and hope", "Try different words", "Switch between verbal, visual and hands-on cues"],
    },
    {
      area: "feedback",
      prompt: "When did someone last watch you teach and give you feedback?",
      options: ["Not since I qualified", "More than a year ago", "In the last year", "Regularly"],
    },
    {
      area: "feedback",
      prompt: "On the way home after class, you mostly think about…",
      options: ["Everything that went wrong", "Whether they'll come back", "One or two things to improve", "What worked, and what I'll try next time"],
    },
    {
      area: "presence",
      prompt: "The experienced regular in the front row…",
      options: ["Makes me nervous", "Gets all my attention, and I lose the others", "Is fine, mostly", "Gets challenged, and everyone stays with me"],
    },
    {
      area: "career",
      prompt: "Your class numbers compared with other instructors'…",
      options: ["I avoid looking", "Lower, and it bothers me", "About the same", "I know what fills my classes"],
    },
    {
      area: "career",
      prompt: "Asking for more classes or better pay feels…",
      options: ["Impossible", "Awkward, so I don't", "Doable, with some nerves", "Normal. I know my value"],
    },
  ],
  bands: [
    {
      min: 21,
      title: "Owning the room",
      body: "You teach with real confidence. Mentorship at your stage is about refinement, career growth and perhaps mentoring others.",
    },
    {
      min: 16,
      title: "Confident, mostly",
      body: "You're a capable instructor with a couple of areas that still catch you out. Tightening those takes you from good to the instructor people book by name.",
    },
    {
      min: 10,
      title: "Finding your feet",
      body: "You can teach a good class, but some situations still knock you off balance. A few targeted skills would change how you feel at the front of the room.",
    },
    {
      min: 0,
      title: "Harder on yourself than anyone",
      body: "Teaching probably feels harder than it should right now, and you're likely more critical of yourself than any client is. That's common after training, and it changes quickly with the right support.",
    },
  ],
  areas: {
    planning: {
      title: "Plan frameworks, not scripts",
      tip: "Build classes from four or five blocks (warm-up, focus, flow, challenge, close) with two or three options for each. You'll never go blank, and you can adapt to the room.",
    },
    clients: {
      title: "Get confident with complex clients",
      tip: "Keep a short list of go-to modifications for backs, knees, shoulders, pregnancy and hypermobility, plus a simple rule for when to refer on. Confidence comes from having a plan.",
    },
    cueing: {
      title: "Cue for every learner",
      tip: "For your five most-taught exercises, write one verbal, one visual and one hands-on cue. When one doesn't land, switch channel instead of repeating it louder.",
    },
    feedback: {
      title: "Get eyes on your teaching",
      tip: "Ask someone you trust to watch a class, or film one and watch it back with a single question in mind. Feedback turns vague worry into something specific to work on.",
    },
    presence: {
      title: "Own the front row",
      tip: "Give the experienced regular a harder option early, then teach to the whole room. Their energy starts working for you instead of against you.",
    },
    career: {
      title: "Know your worth",
      tip: "Keep a simple record of your class numbers, rebookings and client feedback. It turns “can I have more classes?” into a conversation backed by facts.",
    },
  },
};
