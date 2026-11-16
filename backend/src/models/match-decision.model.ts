import { prisma } from "../config/database";
import { pairKey } from "../matching";

/** MatchDecision model: staff decisions (confirmed / rejected pairs). */

/** Pairs staff marked "Not a match" that involve any of these reports. */
export async function findRejectedPairs(reportIds: string[]): Promise<Set<string>> {
  const rows = await prisma.matchDecision.findMany({
    where: { decision: "REJECTED", OR: [{ lostId: { in: reportIds } }, { foundId: { in: reportIds } }] },
    select: { lostId: true, foundId: true },
  });
  return new Set(rows.map((r) => pairKey(r.lostId, r.foundId)));
}

export function findDecision(lostId: string, foundId: string) {
  return prisma.matchDecision.findUnique({ where: { lostId_foundId: { lostId, foundId } } });
}

/** Confirmed pairs whose owner has not collected the item yet. */
export function findAwaitingHandover() {
  return prisma.matchDecision.findMany({
    where: { decision: "CONFIRMED", lost: { status: "MATCH_PENDING" } },
    include: { lost: true, found: true },
    orderBy: { createdAt: "desc" },
  });
}

export function upsertRejection(lostId: string, foundId: string, note: string | null) {
  return prisma.matchDecision.upsert({
    where: { lostId_foundId: { lostId, foundId } },
    create: { lostId, foundId, decision: "REJECTED", note },
    update: { decision: "REJECTED", note },
  });
}
