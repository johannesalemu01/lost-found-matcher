import type { MatchBand, MatchResult, ScoreComponent } from "@lf/shared";
import { BANDS, CAP_MAX_SCORE, TIME_RULES } from "./constants";
import { checkHardRules, type HardRule } from "./rules";
import {
  humanDuration,
  isLocationUnknown,
  scoreCategory,
  scoreColour,
  scoreLocation,
  scoreText,
  scoreTime,
} from "./scoring";
import type { MatchableReport, MatchContext } from "./types";

/**
 * The pipeline for one pair: hard rules → five scored components → plausibility check →
 * caps → band. Everything is deterministic and explained in `reasons`.
 */

export type PairEvaluation =
  | { ok: false; rule: HardRule; message: string }
  | { ok: true; result: Omit<MatchResult, "band"> & { band: MatchBand | null } };

export function bandFor(score: number): MatchBand | null {
  if (score >= BANDS.STRONG) return "STRONG";
  if (score >= BANDS.POSSIBLE) return "POSSIBLE";
  if (score >= BANDS.WEAK) return "WEAK";
  return null; // hidden
}

/** Score one lost/found pair. Order of the arguments does not matter. */
export function evaluatePair(a: MatchableReport, b: MatchableReport, ctx: MatchContext): PairEvaluation {
  const lost = a.type === "LOST" ? a : b;
  const found = a.type === "LOST" ? b : a;

  const blocked = checkHardRules(lost, found, ctx);
  if (blocked) return { ok: false, ...blocked };

  const category = scoreCategory(lost, found);
  const { component: text, brandConflict } = scoreText(lost, found);
  const colour = scoreColour(lost, found);
  const location = scoreLocation(lost, found);
  const time = scoreTime(lost, found);

  const components = [category, text, colour, location, time];
  const reasons: ScoreComponent[] = [...components];
  if (brandConflict) reasons.push(brandConflict);

  // Problem 4: "found weeks later, far away" – each signal alone is weak evidence, together they are implausible.
  const afterWindow = found.eventStart.getTime() - lost.eventEnd.getTime();
  const lateAndFar =
    afterWindow > TIME_RULES.lateAndFarAfter &&
    location.points === 0 &&
    !isLocationUnknown(lost.locations) &&
    !isLocationUnknown(found.locations);
  if (lateAndFar) {
    reasons.push({
      key: "plausibility",
      points: 0,
      max: 0,
      kind: "conflict",
      reason: `⚠ Found ${humanDuration(afterWindow)} later at a place that is not near where it was lost`,
    });
  }

  const raw = Math.max(0, Math.min(100, components.reduce((sum, c) => sum + c.points, 0)));

  // Caps keep a pair with a known problem out of the STRONG band, however high the raw score.
  let score = raw;
  let cap: string | null = null;
  const conflicts = reasons.filter((r) => r.kind === "conflict");
  if (lateAndFar && score > CAP_MAX_SCORE.WEAK) {
    score = CAP_MAX_SCORE.WEAK;
    cap = "Capped at Weak: found much later and far from where it was lost";
  } else if (conflicts.length > 0 && score > CAP_MAX_SCORE.POSSIBLE) {
    score = CAP_MAX_SCORE.POSSIBLE;
    cap = `Capped at Possible: ${conflicts.map((c) => c.key).join(" and ")} conflict needs a human check`;
  } else if (category.points < category.max && score > CAP_MAX_SCORE.POSSIBLE) {
    score = CAP_MAX_SCORE.POSSIBLE;
    cap = 'Capped at Possible: item type is only broadly described ("Other")';
  }

  return {
    ok: true,
    result: { lostId: lost.id, foundId: found.id, score, band: bandFor(score), reasons, cap },
  };
}

/**
 * All visible matches for one report among candidates of the opposite type, best first.
 * Works in both directions (a new LOST report vs FOUND candidates, or the reverse).
 */
export function findMatchesFor(report: MatchableReport, candidates: MatchableReport[], ctx: MatchContext): MatchResult[] {
  const results: MatchResult[] = [];
  for (const candidate of candidates) {
    if (candidate.id === report.id || candidate.type === report.type) continue;
    const evaluation = evaluatePair(report, candidate, ctx);
    if (evaluation.ok && evaluation.result.band) {
      results.push({ ...evaluation.result, band: evaluation.result.band });
    }
  }
  return results.sort((x, y) => y.score - x.score);
}
