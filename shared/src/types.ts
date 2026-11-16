import type { Category, Subcategory } from "./categories";
import type { ColorFamily } from "./colors";

export const REPORT_TYPES = ["LOST", "FOUND"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_STATUSES = ["OPEN", "MATCH_PENDING", "RETURNED", "CLOSED"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** Status as shown to people: "EXPIRED" is computed on read, never stored. */
export type DisplayStatus = ReportStatus | "EXPIRED";

/** An OPEN report older than this is shown as Expired and excluded from matching. */
export const EXPIRY_DAYS = 30;

/** Full report – only staff ever see `privateDetail` and other people's contact. */
export interface Report {
  id: string;
  type: ReportType;
  category: Category;
  subcategory: Subcategory;
  title: string;
  description: string;
  colorFamily: ColorFamily;
  brand: string | null;
  locations: string[];
  /** ISO strings (UTC). LOST: window when it was lost. FOUND: start = end = time found. */
  eventStart: string;
  eventEnd: string;
  privateDetail: string | null;
  contactName: string;
  contactEmailOrPhone: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

/** What public endpoints return: no private detail, no contact details. */
export type PublicReport = Omit<Report, "privateDetail" | "contactName" | "contactEmailOrPhone"> & {
  displayStatus: DisplayStatus;
};

export type MatchBand = "STRONG" | "POSSIBLE" | "WEAK";

export type ReasonKind = "support" | "neutral" | "conflict";

export interface ScoreComponent {
  /** The five scored components, or an extra warning ("brand", "plausibility") worth 0 points. */
  key: "category" | "text" | "colour" | "location" | "time" | "brand" | "plausibility";
  points: number;
  max: number;
  reason: string;
  kind: ReasonKind;
}

export interface MatchResult {
  lostId: string;
  foundId: string;
  /** 0–100 */
  score: number;
  band: MatchBand;
  /** One line per scoring component, in a fixed order, plus any extra warnings. */
  reasons: ScoreComponent[];
  /** Why the band was capped below what the raw score would give, if it was. */
  cap: string | null;
}

export type Decision = "CONFIRMED" | "REJECTED";

export function isExpired(
  r: { status: ReportStatus; createdAt: string | Date },
  now: Date = new Date(),
): boolean {
  if (r.status !== "OPEN") return false;
  const created = typeof r.createdAt === "string" ? new Date(r.createdAt) : r.createdAt;
  return now.getTime() - created.getTime() > EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

export function displayStatus(
  r: { status: ReportStatus; createdAt: string | Date },
  now: Date = new Date(),
): DisplayStatus {
  return isExpired(r, now) ? "EXPIRED" : r.status;
}
