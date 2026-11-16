import type { MatchBand } from "@lf/shared";
import { conflict, notFound } from "../utils/errors";
import { prisma } from "../config/database";
import { evaluatePair, findMatchesFor, verificationQuestion } from "../matching";
import type { AwaitingHandover, MatchWithCounterpart, ReportRow, StaffMatchGroup } from "../interfaces";
import * as ReportModel from "../models/report.model";
import { toReport } from "../utils/serializers";
import * as MatchDecisionModel from "../models/match-decision.model";

// ───────────────────────────── Suggestions (read) ─────────────────────────────

/** Visible matches for one report, best first, with the report on the other side. */
export async function matchesForReport(report: ReportRow, now = new Date()): Promise<MatchWithCounterpart[]> {
  const candidates = await ReportModel.findMatchCandidates(report, now);
  if (candidates.length === 0) return [];
  const rejectedPairs = await MatchDecisionModel.findRejectedPairs([report.id]);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  return findMatchesFor(report, candidates, { now, rejectedPairs }).map((match) => ({
    match,
    other: byId.get(report.type === "LOST" ? match.foundId : match.lostId)!,
  }));
}

/** Every open, unexpired lost report with its suggested found matches (staff view). */
export async function suggestedMatches(band?: MatchBand, now = new Date()): Promise<StaffMatchGroup[]> {
  const lostReports = await ReportModel.findActiveReports("LOST", now);
  const groups: StaffMatchGroup[] = [];
  for (const lost of lostReports) {
    const matches = (await matchesForReport(lost, now))
      .filter(({ match }) => !band || match.band === band)
      .map(({ match, other }) => ({
        ...match,
        found: toReport(other),
        verificationQuestion: verificationQuestion(lost.subcategory),
      }));
    if (matches.length > 0) groups.push({ lost: toReport(lost), matches });
  }
  return groups.sort((a, b) => b.matches[0].score - a.matches[0].score);
}

/** Pairs staff confirmed that are waiting for the owner to collect the item. */
export async function awaitingHandover(): Promise<AwaitingHandover[]> {
  const decisions = await MatchDecisionModel.findAwaitingHandover();
  return decisions.map((d) => {
    // Re-score as of the moment it was confirmed, so staff still see *why* it matched.
    const evaluation = evaluatePair({ ...d.lost, status: "OPEN" }, { ...d.found, status: "OPEN" }, { now: d.createdAt });
    const result = evaluation.ok
      ? evaluation.result
      : { lostId: d.lostId, foundId: d.foundId, score: 0, band: null, reasons: [], cap: null };
    return {
      ...result,
      lost: toReport(d.lost),
      found: toReport(d.found),
      verificationQuestion: verificationQuestion(d.lost.subcategory),
      confirmedAt: d.createdAt.toISOString(),
    };
  });
}

// ───────────────────────────── Decisions (write) ─────────────────────────────

async function assertPairExists(lostId: string, foundId: string) {
  const [lost, found] = await Promise.all([ReportModel.findReportById(lostId), ReportModel.findReportById(foundId)]);
  if (!lost || lost.type !== "LOST") throw notFound("Lost report not found.");
  if (!found || found.type !== "FOUND") throw notFound("Found report not found.");
}

/** Confirm: both reports → MATCH_PENDING and the decision is recorded, all or nothing. */
export async function confirmMatch(lostId: string, foundId: string, note: string | null) {
  await assertPairExists(lostId, foundId);
  await prisma.$transaction(async (tx) => {
    // Conditional update: if either report was taken by another decision meanwhile, nothing changes.
    const updated = await tx.report.updateMany({
      where: { id: { in: [lostId, foundId] }, status: "OPEN" },
      data: { status: "MATCH_PENDING" },
    });
    if (updated.count !== 2) throw conflict("One of these reports is no longer open.");
    await tx.matchDecision.upsert({
      where: { lostId_foundId: { lostId, foundId } },
      create: { lostId, foundId, decision: "CONFIRMED", note },
      update: { decision: "CONFIRMED", verified: false, note },
    });
  });
}

/** "Not a match": remembered so the pair is never suggested again. */
export async function rejectMatch(lostId: string, foundId: string, note: string | null) {
  await assertPairExists(lostId, foundId);
  const existing = await MatchDecisionModel.findDecision(lostId, foundId);
  if (existing?.decision === "CONFIRMED") throw conflict("This match is confirmed. Undo it first.");
  await MatchDecisionModel.upsertRejection(lostId, foundId, note);
}

/** Undo a confirm or a reject: the decision is removed and a confirmed pair is reopened. */
export async function undoDecision(lostId: string, foundId: string) {
  await prisma.$transaction(async (tx) => {
    const decision = await tx.matchDecision.findUnique({ where: { lostId_foundId: { lostId, foundId } } });
    if (!decision) throw notFound("There is no decision to undo for this pair.");
    if (decision.decision === "CONFIRMED") {
      const reopened = await tx.report.updateMany({
        where: { id: { in: [lostId, foundId] }, status: "MATCH_PENDING" },
        data: { status: "OPEN" },
      });
      if (reopened.count !== 2) throw conflict("This item has already been returned or closed.");
    }
    await tx.matchDecision.delete({ where: { id: decision.id } });
  });
}

/** Handover done – only after staff ticked that the owner passed the verification question. */
export async function markReturned(lostId: string, foundId: string, note: string | null) {
  await prisma.$transaction(async (tx) => {
    const decision = await tx.matchDecision.findUnique({ where: { lostId_foundId: { lostId, foundId } } });
    if (decision?.decision !== "CONFIRMED") throw conflict("Confirm the match before marking it returned.");
    const updated = await tx.report.updateMany({
      where: { id: { in: [lostId, foundId] }, status: "MATCH_PENDING" },
      data: { status: "RETURNED" },
    });
    if (updated.count !== 2) throw conflict("These reports are not waiting for handover.");
    await tx.matchDecision.update({ where: { id: decision.id }, data: { verified: true, note: note ?? decision.note } });
  });
}
