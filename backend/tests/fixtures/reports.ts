import type { MatchableReport } from "../../src/matching";

let counter = 0;

/** Monday 9 Nov 2026 – all fixture times are relative to this (UTC). */
export const MONDAY = new Date("2026-11-09T00:00:00Z");

export function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date(MONDAY);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

export function lost(overrides: Partial<MatchableReport> = {}): MatchableReport {
  return {
    id: `lost-${++counter}`,
    type: "LOST",
    subcategory: "BACKPACK",
    title: "Black backpack",
    description: "Black backpack",
    colorFamily: "BLACK_DARK",
    brand: null,
    locations: ["MAIN_LIBRARY"],
    eventStart: at(0, 12),
    eventEnd: at(0, 17),
    status: "OPEN",
    createdAt: at(0, 18),
    ...overrides,
  };
}

export function found(overrides: Partial<MatchableReport> = {}): MatchableReport {
  const when = overrides.eventStart ?? at(0, 19);
  return {
    id: `found-${++counter}`,
    type: "FOUND",
    subcategory: "BACKPACK",
    title: "Backpack",
    description: "Backpack",
    colorFamily: "BLACK_DARK",
    brand: null,
    locations: ["MAIN_LIBRARY"],
    eventStart: when,
    eventEnd: when,
    status: "OPEN",
    createdAt: when,
    ...overrides,
  };
}
