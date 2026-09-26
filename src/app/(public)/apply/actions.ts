"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { appUrl } from "@/lib/site";
import { notifyAdmin, sendEmailAsync } from "@/lib/email";
import { adminNewApplicationEmail, applicationReceivedEmail } from "@/lib/emails";
import { DISCIPLINES, INSTRUCTOR_STAGES } from "@/content/instructors";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email").trim().toLowerCase(),
  cohortId: z.string().min(1, "Please choose a cohort"),
  currentRole: z.string().trim().min(2, "Please tell us your current role").max(200),
  background: z.string().trim().min(20, "Tell us a little more about your background (20+ characters)").max(4000),
  goals: z.string().trim().min(20, "Tell us a little more about your goals (20+ characters)").max(4000),
  linkedinUrl: z.union([z.literal(""), z.url({ protocol: /^https?$/, error: "Links must be a full https:// URL" })]).optional(),
});

const instructorSchema = z.object({
  instructorStage: z.enum(INSTRUCTOR_STAGES as [string, ...string[]], { error: "Please tell us where you are in your teaching" }),
  disciplines: z.enum(DISCIPLINES as [string, ...string[]], { error: "Please tell us what you teach" }),
});

const studioSchema = z.object({
  studioName: z.string().trim().min(2, "Please enter your studio's name").max(160),
  studioLocation: z.string().trim().min(2, "Please tell us where your studio is").max(160),
  studioStage: z.string().trim().min(1, "Please tell us how long your studio has been open").max(60),
});

export type ApplyState = { error?: string; values?: Record<string, string> } | null;

export async function submitApplication(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const raw = Object.fromEntries(
    ["name", "email", "cohortId", "currentRole", "background", "goals", "linkedinUrl", "studioName", "studioLocation", "studioStage", "wantsSoftware", "instructorStage", "disciplines"].map((k) => [k, String(formData.get(k) ?? "")]),
  );

  // Honeypot: real users never see or fill this field.
  if (formData.get("company")) redirect("/apply/thanks");

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values: raw };
  const data = parsed.data;

  const cohort = await prisma.cohort.findFirst({ where: { id: data.cohortId, isOpen: true } });
  if (!cohort) return { error: "That intake is no longer taking applications.", values: raw };

  // Track-specific fields: required for their own track, ignored otherwise.
  let studio: z.infer<typeof studioSchema> | null = null;
  let instructor: z.infer<typeof instructorSchema> | null = null;
  if (cohort.track === "STUDIO") {
    const s = studioSchema.safeParse(raw);
    if (!s.success) return { error: s.error.issues[0].message, values: raw };
    studio = s.data;
  } else {
    const i = instructorSchema.safeParse(raw);
    if (!i.success) return { error: i.error.issues[0].message, values: raw };
    instructor = i.data;
  }

  const duplicate = await prisma.application.findFirst({
    where: { email: data.email, cohortId: cohort.id, status: { in: ["PENDING", "ACCEPTED", "WAITLISTED"] } },
  });
  if (duplicate) return { error: "You've already applied for this intake — we'll be in touch.", values: raw };

  await prisma.application.create({
    data: { ...data, ...studio, ...instructor, wantsSoftware: studio ? formData.get("wantsSoftware") === "on" : false, linkedinUrl: data.linkedinUrl || null, cohortId: cohort.id },
  });

  sendEmailAsync({ to: data.email, ...applicationReceivedEmail({ name: data.name, cohortName: cohort.name }) });
  notifyAdmin(
    adminNewApplicationEmail({
      name: data.name,
      email: data.email,
      cohortName: cohort.name,
      url: `${appUrl()}/admin/applications`,
    }),
  );

  redirect("/apply/thanks");
}
