import { displayStatus, type PublicReport, type Report } from "@lf/shared";
import type { ReportRow, StaffReport } from "../interfaces";

/**
 * The only way report rows leave the API. Public output strips the private detail and
 * contact details; staff output keeps them.
 */

export function toReport(r: ReportRow): Report {
  return {
    ...r,
    eventStart: r.eventStart.toISOString(),
    eventEnd: r.eventEnd.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toPublicReport(r: ReportRow, now = new Date()): PublicReport {
  const { privateDetail: _p, contactName: _n, contactEmailOrPhone: _c, ...rest } = toReport(r);
  return { ...rest, displayStatus: displayStatus(r, now) };
}

export function toStaffReport(r: ReportRow, now = new Date()): StaffReport {
  return { ...toReport(r), displayStatus: displayStatus(r, now) };
}
