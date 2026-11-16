import { CATEGORY_INFO, SUBCATEGORY_LABELS, locationLabel } from "@lf/shared";
import type { MyReportItem } from "@/interfaces";
import { cx } from "@/utils/cx";
import { formatEventTime, timeAgo } from "@/utils/format";
import { reportProgress } from "@/utils/report-progress";
import { Card, ProgressTracker, StatusBadge, TypeBadge } from "@/components/ui";

/** One of the student's own reports: what it is, where it stands, and what to do next. */
export function MyReportCard({ item }: { item: MyReportItem }) {
  const { report, message, matchCount } = item;
  const progress = reportProgress(report, matchCount);

  const tone =
    progress.group === "ready"
      ? "bg-amber-50 text-amber-900"
      : report.displayStatus === "RETURNED"
        ? "bg-emerald-50 text-emerald-900"
        : matchCount > 0
          ? "bg-accent-50 text-accent-800"
          : "bg-stone-50 text-stone-600";

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={report.type} />
            <StatusBadge status={report.displayStatus} />
          </div>
          <h3 className="mt-1.5 font-semibold text-stone-900">
            <span aria-hidden className="mr-1">
              {CATEGORY_INFO[report.category].icon}
            </span>
            {report.title}
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            {SUBCATEGORY_LABELS[report.subcategory]} · {report.locations.map(locationLabel).join(", ")} · {formatEventTime(report)}
          </p>
        </div>
        <span className="text-xs text-stone-400">Reported {timeAgo(report.createdAt)}</span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <ProgressTracker steps={progress.steps} current={progress.current} stopped={progress.stopped} />
      </div>

      <p className={cx("border-t border-stone-100 px-4 py-3 text-sm sm:px-5", tone)}>
        {progress.group === "ready" && <span className="mr-1" aria-hidden>📍</span>}
        {message}
      </p>
    </Card>
  );
}
