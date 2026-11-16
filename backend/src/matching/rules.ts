import { categoryCompatibility, isExpired } from "@lf/shared";
import { TIME_RULES } from "./constants";
import { pairKey, type MatchableReport, type MatchContext } from "./types";

/**
 * Hard rules: pairs that can never be the same item, whatever the score would be.
 * They run before scoring, so impossible pairs are never shown.
 */
export type HardRule =
  | "SAME_TYPE"
  | "NOT_OPEN"
  | "EXPIRED"
  | "PREVIOUSLY_REJECTED"
  | "INCOMPATIBLE_CATEGORY"
  | "FOUND_BEFORE_LOST"
  | "FOUND_TOO_LATE";

export interface RuleViolation {
  rule: HardRule;
  message: string;
}

/** Returns the first rule the pair breaks, or null when it may be scored. */
export function checkHardRules(lost: MatchableReport, found: MatchableReport, ctx: MatchContext): RuleViolation | null {
  if (lost.type !== "LOST" || found.type !== "FOUND") {
    return { rule: "SAME_TYPE", message: "A match needs one lost and one found report" };
  }
  for (const r of [lost, found]) {
    if (r.status !== "OPEN") return { rule: "NOT_OPEN", message: `Report ${r.id} is ${r.status}` };
    if (isExpired(r, ctx.now)) return { rule: "EXPIRED", message: `Report ${r.id} has expired` };
  }
  if (ctx.rejectedPairs?.has(pairKey(lost.id, found.id))) {
    return { rule: "PREVIOUSLY_REJECTED", message: "Staff already marked this pair as not a match" };
  }
  if (categoryCompatibility(lost.subcategory, found.subcategory) === "INCOMPATIBLE") {
    return { rule: "INCOMPATIBLE_CATEGORY", message: `${lost.subcategory} cannot be ${found.subcategory}` };
  }
  const foundAt = found.eventStart.getTime();
  if (foundAt < lost.eventStart.getTime() - TIME_RULES.beforeWindowTolerance) {
    return { rule: "FOUND_BEFORE_LOST", message: "Found before it was lost" };
  }
  if (foundAt > lost.eventEnd.getTime() + TIME_RULES.maxAfterWindow) {
    return { rule: "FOUND_TOO_LATE", message: "Found more than 30 days after it was lost" };
  }
  return null;
}
