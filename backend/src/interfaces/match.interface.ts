import type { MatchBand, MatchResult, Report } from "@lf/shared";
import type { ReportRow } from "./report.interface";

/** An engine result together with the report on the other side. */
export interface MatchWithCounterpart {
  match: MatchResult;
  other: ReportRow;
}

/** A suggestion as staff see it: full found report + the question to ask the claimant. */
export interface StaffMatch extends MatchResult {
  found: Report;
  verificationQuestion: string;
}

/** Suggestions grouped under one lost report. */
export interface StaffMatchGroup {
  lost: Report;
  matches: StaffMatch[];
}

/** A confirmed pair waiting for the owner to collect the item. */
export interface AwaitingHandover extends Omit<StaffMatch, "band"> {
  lost: Report;
  band: MatchBand | null;
  confirmedAt: string;
}

/** Response of GET /api/matches. */
export interface StaffMatchesResponse {
  groups: StaffMatchGroup[];
  awaitingHandover: AwaitingHandover[];
}
