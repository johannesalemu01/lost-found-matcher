import type { PublicReport } from "@lf/shared";

export type ReportGroup = "ready" | "progress" | "finished";

export interface ReportProgress {
  steps: string[];
  /** Index of the step in progress (steps before it are done; = steps.length when all done). */
  current: number;
  stopped: boolean;
  group: ReportGroup;
}

const LOST_STEPS = ["Reported", "Possible matches", "Confirmed by staff", "Returned to you"];
const FOUND_STEPS = ["Handed in", "Possible owner", "Owner confirmed", "Returned to owner"];

/** Where a report is in its life, for the student's progress tracker and grouping. */
export function reportProgress(report: PublicReport, matchCount: number): ReportProgress {
  const steps = report.type === "LOST" ? LOST_STEPS : FOUND_STEPS;
  switch (report.displayStatus) {
    case "RETURNED":
      return { steps, current: steps.length, stopped: false, group: "finished" };
    case "MATCH_PENDING":
      return { steps, current: 2, stopped: false, group: "ready" };
    case "OPEN":
      return { steps, current: matchCount > 0 ? 1 : 0, stopped: false, group: "progress" };
    case "CLOSED":
    case "EXPIRED":
      return { steps, current: 0, stopped: true, group: "finished" };
  }
}

export const GROUP_INFO: Record<ReportGroup, { title: string; hint: string }> = {
  ready: { title: "Ready to collect", hint: "Staff confirmed a match – see the next step below." },
  progress: { title: "In progress", hint: "We check every new report against yours automatically." },
  finished: { title: "Finished", hint: "Returned, closed or expired." },
};
