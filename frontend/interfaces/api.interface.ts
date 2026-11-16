import type {
  ColorFamily,
  DisplayStatus,
  MatchBand,
  MatchResult,
  PublicReport,
  Report,
  ReportType,
  Subcategory,
} from "@lf/shared";

/** Shapes of the API's requests and responses (mirrors backend/src/interfaces). */

export type AssistSource = "ai" | "rules";

export interface ClarityResponse {
  level: "vague" | "ok" | "good";
  questions: string[];
  source: AssistSource;
}

export interface ClarityRequest {
  type: ReportType;
  text: string;
  subcategory?: Subcategory | null;
  colorFamily?: ColorFamily | null;
  brand?: string;
  /** Omit until the person has reached the location step. */
  locations?: string[];
}

export interface ExtractResponse {
  subcategory: Subcategory | null;
  colorFamily: ColorFamily | null;
  brand: string | null;
  features: string[];
  source: AssistSource;
}

export interface CreateReportRequest {
  type: ReportType;
  subcategory: Subcategory;
  title: string;
  description: string;
  colorFamily: ColorFamily;
  brand: string;
  locations: string[];
  eventStart: string;
  eventEnd: string;
  privateDetail: string;
  contactName: string;
  contactEmailOrPhone: string;
}

export interface CreatedReportResponse {
  report: PublicReport;
  matches: (MatchResult & { other: PublicReport })[];
  clarity: ClarityResponse;
}

/** Staff get the full report; students get PublicReport. */
export type StaffReport = Report & { displayStatus: DisplayStatus };

export interface MyReportItem {
  report: PublicReport;
  matchCount: number;
  message: string;
}

export interface StaffMatch extends MatchResult {
  found: Report;
  verificationQuestion: string;
}

export interface StaffMatchGroup {
  lost: Report;
  matches: StaffMatch[];
}

export interface AwaitingHandover extends Omit<StaffMatch, "band"> {
  lost: Report;
  band: MatchBand | null;
  confirmedAt: string;
}

export interface StaffMatchesResponse {
  groups: StaffMatchGroup[];
  awaitingHandover: AwaitingHandover[];
}

export interface StatsResponse {
  openLost: number;
  openFound: number;
  strongMatches: number;
}

export interface ReportFilters {
  type?: ReportType;
  q?: string;
  category?: string;
  status?: string;
}
