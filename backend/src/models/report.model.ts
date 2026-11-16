import type { Prisma, ReportType } from "@prisma/client";
import { EXPIRY_DAYS, parentOf } from "@lf/shared";
import { TIME_RULES, type MatchableReport } from "../matching";
import { prisma } from "../config/database";
import type { CreateReportInput, ListReportsQuery, ReportRow } from "../interfaces";

const DAY = 24 * 60 * 60 * 1000;

/** Report model: every database query on the Report table lives here. */

/** SQL condition for "OPEN and not expired" (expiry is computed, never stored). */
export function activeWhere(now: Date): Prisma.ReportWhereInput {
  return { status: "OPEN", createdAt: { gte: new Date(now.getTime() - EXPIRY_DAYS * DAY) } };
}

export function createReport(input: CreateReportInput): Promise<ReportRow> {
  return prisma.report.create({ data: { ...input, category: parentOf(input.subcategory) } });
}

export function findReportById(id: string): Promise<ReportRow | null> {
  return prisma.report.findUnique({ where: { id } });
}

export function listReports(query: ListReportsQuery, now: Date): Promise<ReportRow[]> {
  const where: Prisma.ReportWhereInput = {};
  if (query.type) where.type = query.type;
  if (query.category) where.category = query.category;

  if (query.status === "EXPIRED") {
    Object.assign(where, { status: "OPEN", createdAt: { lt: new Date(now.getTime() - EXPIRY_DAYS * DAY) } });
  } else if (query.status === "OPEN") {
    Object.assign(where, activeWhere(now));
  } else if (query.status) {
    where.status = query.status;
  }

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { brand: { contains: query.q, mode: "insensitive" } },
    ];
  }
  return prisma.report.findMany({ where, orderBy: { eventStart: "desc" }, take: 200 });
}

export function findReportsByContact(contact: string): Promise<ReportRow[]> {
  return prisma.report.findMany({ where: { contactEmailOrPhone: contact }, orderBy: { createdAt: "desc" } });
}

export function findActiveReports(type: ReportType, now: Date): Promise<ReportRow[]> {
  return prisma.report.findMany({ where: { type, ...activeWhere(now) }, orderBy: { createdAt: "desc" } });
}

export function countActiveReports(type: ReportType, now: Date): Promise<number> {
  return prisma.report.count({ where: { type, ...activeWhere(now) } });
}

export function closeReport(id: string): Promise<ReportRow> {
  return prisma.report.update({ where: { id }, data: { status: "CLOSED" } });
}

/**
 * Cheap SQL pre-filter so the engine only scores plausible candidates:
 * opposite type, OPEN, not expired, same parent category (or "Other"), and a date range
 * mirroring the engine's hard time rules. The engine re-checks everything, so this can
 * only narrow the candidates, never let a wrong one through.
 */
export function findMatchCandidates(report: MatchableReport, now: Date): Promise<ReportRow[]> {
  const category: Prisma.ReportWhereInput =
    report.subcategory === "OTHER" ? {} : { category: { in: [parentOf(report.subcategory), "OTHER"] } };

  const tolerance = TIME_RULES.beforeWindowTolerance;
  const maxAfter = TIME_RULES.maxAfterWindow;
  const time: Prisma.ReportWhereInput =
    report.type === "LOST"
      ? {
          eventStart: {
            gte: new Date(report.eventStart.getTime() - tolerance),
            lte: new Date(report.eventEnd.getTime() + maxAfter),
          },
        }
      : {
          eventStart: { lte: new Date(report.eventStart.getTime() + tolerance) },
          eventEnd: { gte: new Date(report.eventStart.getTime() - maxAfter) },
        };

  return prisma.report.findMany({
    where: { type: report.type === "LOST" ? "FOUND" : "LOST", ...activeWhere(now), ...category, ...time },
  });
}
