import { displayStatus } from "@lf/shared";
import { conflict, notFound } from "../utils/errors";
import { clarityCheck } from "./assist.service";
import { matchesForReport } from "./matches.service";
import * as ReportModel from "../models/report.model";
import { assertImage, deletePhoto, readPhoto, savePhoto } from "./photo.service";
import { statusMessage } from "../utils/status-messages";
import type { CreatedReportResponse, CreateReportInput, ListReportsQuery, MyReportItem } from "../interfaces";
import { toPublicReport, toReport, toStaffReport } from "../utils/serializers";

const TOP_MATCHES_FOR_REPORTER = 5;

/**
 * Save a report (and its optional staff-only photo), then immediately give the reporter
 * their top matches and any clarity questions. The photo is never used for scoring.
 */
export async function createReport(input: CreateReportInput, photo?: Buffer): Promise<CreatedReportResponse> {
  if (photo) assertImage(photo); // reject a bad file before anything is saved
  const photoFile = photo ? await savePhoto(photo) : null;
  let report;
  try {
    report = await ReportModel.createReport(input, photoFile);
  } catch (err) {
    if (photoFile) await deletePhoto(photoFile);
    throw err;
  }

  const [matches, clarity] = await Promise.all([
    matchesForReport(report),
    clarityCheck({
      type: report.type,
      subcategory: report.subcategory,
      title: report.title,
      description: report.description,
      colorFamily: report.colorFamily,
      brand: report.brand,
      locations: report.locations,
    }),
  ]);

  return {
    report: toPublicReport(report),
    // The reporter sees why something matched, but never the other person's contact or private detail.
    matches: matches.slice(0, TOP_MATCHES_FOR_REPORTER).map(({ match, other }) => ({ ...match, other: toPublicReport(other) })),
    clarity,
  };
}

/** Public list; staff additionally get contact and private details. */
export async function listReports(query: ListReportsQuery, asStaff: boolean) {
  const now = new Date();
  const rows = await ReportModel.listReports(query, now);
  return rows.map((r) => (asStaff ? toStaffReport(r, now) : toPublicReport(r, now)));
}

/** Student view: own reports by email/phone with status, match count and a friendly message. */
export async function myReports(contact: string): Promise<MyReportItem[]> {
  const now = new Date();
  const rows = await ReportModel.findReportsByContact(contact);
  return Promise.all(
    rows.map(async (r) => {
      const open = displayStatus(r, now) === "OPEN";
      const matchCount = open
        ? (await matchesForReport(r, now)).filter(({ match }) => match.band !== "WEAK").length
        : 0;
      return { report: toPublicReport(r, now), matchCount, message: statusMessage(r, matchCount, now) };
    }),
  );
}

export async function closeReport(id: string) {
  const existing = await ReportModel.findReportById(id);
  if (!existing) throw notFound("Report not found.");
  if (existing.status === "MATCH_PENDING") {
    throw conflict("This report has a confirmed match. Undo the match or mark it returned first.");
  }
  return toReport(await ReportModel.closeReport(id));
}

/** Staff only: the photo attached to a report. */
export async function getReportPhoto(id: string) {
  const report = await ReportModel.findReportById(id);
  if (!report?.photoFile) throw notFound("This report has no photo.");
  return readPhoto(report.photoFile);
}
