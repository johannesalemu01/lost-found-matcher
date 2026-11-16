import type { ReportType } from "@lf/shared";

export interface TimePreset {
  label: string;
  /** [start, end] in the viewer's local time; never in the future. */
  range: () => [Date, Date];
}

const now = () => new Date();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
const todayAt = (h: number) => {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d;
};
const notAfterNow = (d: Date) => (d < now() ? d : now());

/** Quick picks for the time field: a window for LOST, a single moment for FOUND. */
export function timePresets(type: ReportType): TimePreset[] {
  if (type === "FOUND") {
    return [
      { label: "Just now", range: () => [now(), now()] },
      { label: "An hour ago", range: () => [hoursAgo(1), hoursAgo(1)] },
      { label: "This morning", range: () => [notAfterNow(todayAt(10)), notAfterNow(todayAt(10))] },
    ];
  }
  return [
    { label: "This morning", range: () => [notAfterNow(todayAt(6)), notAfterNow(todayAt(12))] },
    { label: "This afternoon", range: () => [notAfterNow(todayAt(12)), notAfterNow(todayAt(18))] },
    {
      label: "Yesterday",
      range: () => {
        const start = todayAt(0);
        start.setDate(start.getDate() - 1);
        const end = new Date(start);
        end.setHours(23, 59);
        return [start, end];
      },
    },
    { label: "Not sure – last 3 days", range: () => [hoursAgo(72), now()] },
  ];
}
