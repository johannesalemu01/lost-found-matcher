import type { z } from "zod";
import type { Report as ReportRow } from "@prisma/client";
import type { DisplayStatus, MatchResult, PublicReport, Report } from "@lf/shared";
import type { ClarityResponse } from "./assist.interface";
import type { createReportSchema, listReportsQuerySchema } from "../validators/report.validator";

/** A report row as stored in the database (Dates, not ISO strings). */
export type { ReportRow };

/** Validated body of POST /api/reports. */
export type CreateReportInput = z.output<typeof createReportSchema>;

/** Validated query of GET /api/reports. */
export type ListReportsQuery = z.output<typeof listReportsQuerySchema>;

/** What staff see for a report (includes contact + private detail). */
export type StaffReport = Report & { displayStatus: DisplayStatus };

/** Response of POST /api/reports. */
export interface CreatedReportResponse {
  report: PublicReport;
  matches: (MatchResult & { other: PublicReport })[];
  clarity: ClarityResponse;
}

/** One row of GET /api/reports/mine. */
export interface MyReportItem {
  report: PublicReport;
  matchCount: number;
  message: string;
}

export interface StatsResponse {
  openLost: number;
  openFound: number;
  strongMatches: number;
}
