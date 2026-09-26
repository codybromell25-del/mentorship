"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { appUrl, site } from "@/lib/site";
import { software } from "@/lib/software";
import { notifyAdmin, sendEmailAsync } from "@/lib/email";
import { adminSoftwareEnquiryEmail, softwareEnquiryReceivedEmail } from "@/lib/emails";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email").trim().toLowerCase(),
  studioName: z.string().trim().min(2, "Please enter your studio's name").max(160),
  studioLocation: z.string().trim().max(160).optional(),
  bookingSystem: z.string().trim().max(80).optional(),
  message: z.string().trim().max(4000).optional(),
});

export type EnquiryState = { error?: string; values?: Record<string, string> } | null;

export async function submitSoftwareEnquiry(prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  try {
    return await handleEnquiry(prev, formData);
  } catch (e) {
    unstable_rethrow(e); // lets redirect("/balancehq/thanks") through
    console.error("[balancehq] enquiry failed:", e);
    return {
      error: `We couldn't send your enquiry just now. Please try again shortly, or email ${site.contactEmail}.`,
      values: Object.fromEntries([...formData].map(([k, v]) => [k, String(v)])),
    };
  }
}

async function handleEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const raw = Object.fromEntries(
    ["name", "email", "studioName", "studioLocation", "bookingSystem", "message"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  if (formData.get("company")) redirect("/balancehq/thanks"); // honeypot

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values: raw };
  const valid = new Set(software.map((t) => t.key));
  const tools = formData.getAll("tools").map(String).filter((k) => valid.has(k));
  if (tools.length === 0) return { error: "Tick at least one tool you're interested in.", values: raw };

  const d = parsed.data;
  await prisma.softwareEnquiry.create({
    data: {
      ...d,
      studioLocation: d.studioLocation || null,
      bookingSystem: d.bookingSystem || null,
      message: d.message || null,
      tools,
    },
  });

  sendEmailAsync({ to: d.email, ...softwareEnquiryReceivedEmail({ name: d.name }) });
  notifyAdmin(adminSoftwareEnquiryEmail({ name: d.name, email: d.email, studioName: d.studioName, tools, url: `${appUrl()}/admin/enquiries` }));
  redirect("/balancehq/thanks");
}
