import type { Track } from "@prisma/client";
import { prisma } from "@/lib/db";

export type Intake = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  priceCents: number;
  currency: string;
  capacity: number;
  placesLeft: number; // real: capacity minus paid or awaiting-payment places
};

/** Open, upcoming intakes for a programme, with honest places-left counts. */
export async function getOpenIntakes(track: Track): Promise<Intake[]> {
  const cohorts = await prisma.cohort.findMany({
    where: { track, isOpen: true, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    include: { _count: { select: { enrollments: { where: { status: { in: ["AWAITING_PAYMENT", "ACTIVE", "COMPLETED"] } } } } } },
  });
  return cohorts.map(({ _count, ...c }) => ({ ...c, placesLeft: Math.max(0, c.capacity - _count.enrollments) }));
}
