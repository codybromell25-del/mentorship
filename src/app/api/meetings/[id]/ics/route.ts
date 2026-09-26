import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { site } from "@/lib/site";

/** Calendar file for one session, for participants without a Google invite. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const m = await prisma.meeting.findUnique({
    where: { id },
    include: { enrollment: { include: { mentee: { select: { name: true } }, mentor: { select: { name: true } } } } },
  });
  const uid = session.user.id;
  const allowed = m && (session.user.role === "ADMIN" || m.enrollment.menteeId === uid || m.enrollment.mentorId === uid);
  if (!m || !allowed) return new NextResponse("Not found", { status: 404 });

  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const title = `${site.name}: ${m.enrollment.mentee?.name ?? "Mentee"} & ${m.enrollment.mentor?.name ?? "Mentor"}`;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//balance mentorship//EN",
    "BEGIN:VEVENT",
    `UID:${m.id}@balance-mentorship`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(m.scheduledAt)}`,
    `DTEND:${stamp(new Date(+m.scheduledAt + m.durationMin * 60_000))}`,
    `SUMMARY:${esc(title)}`,
    ...(m.location ? [`LOCATION:${esc(m.location)}`] : []),
    ...(m.agenda ? [`DESCRIPTION:${esc(m.agenda)}`] : []),
    `STATUS:${m.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="session-${m.scheduledAt.toISOString().slice(0, 10)}.ics"`,
    },
  });
}
