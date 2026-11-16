import type { MyReportItem } from "@/interfaces";
import { cx } from "@/utils/cx";
import { timeAgo } from "@/utils/format";
import { Card } from "@/components/ui";
import { ReportSummary } from "@/components/reports/ReportSummary";

/** One of the student's own reports, with the friendly status line from the API. */
export function MyReportCard({ item }: { item: MyReportItem }) {
  const { report, message, matchCount } = item;
  const tone =
    report.displayStatus === "MATCH_PENDING"
      ? "bg-amber-50 text-amber-900 ring-amber-200"
      : report.displayStatus === "RETURNED"
        ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
        : matchCount > 0
          ? "bg-accent-50 text-accent-800 ring-accent-200"
          : "bg-stone-50 text-stone-600 ring-stone-200";

  return (
    <Card className="p-4">
      <ReportSummary report={report} />
      <p className={cx("mt-3 rounded-lg px-3 py-2 text-sm ring-1 ring-inset", tone)}>{message}</p>
      <p className="mt-2 text-xs text-stone-400">Reported {timeAgo(report.createdAt)}</p>
    </Card>
  );
}
