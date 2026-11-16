import type { ColorFamily, ReportStatus, ReportType, Subcategory } from "@lf/shared";

/** The fields the engine needs. Plain data – works with Prisma rows or test fixtures. */
export interface MatchableReport {
  id: string;
  type: ReportType;
  subcategory: Subcategory;
  title: string;
  description: string;
  colorFamily: ColorFamily;
  brand: string | null;
  locations: string[];
  eventStart: Date;
  eventEnd: Date;
  status: ReportStatus;
  createdAt: Date;
}

export interface MatchContext {
  now: Date;
  /** Keys from pairKey(lostId, foundId) that staff marked "Not a match". */
  rejectedPairs?: ReadonlySet<string>;
}

export function pairKey(lostId: string, foundId: string): string {
  return `${lostId}:${foundId}`;
}
