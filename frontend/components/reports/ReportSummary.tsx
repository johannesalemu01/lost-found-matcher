import { CATEGORY_INFO, COLOR_INFO, SUBCATEGORY_LABELS, locationLabel, type PublicReport } from "@lf/shared";
import { formatEventTime } from "@/utils/format";
import { StatusBadge, TypeBadge } from "@/components/ui";

type Summarisable = Pick<
  PublicReport,
  "type" | "category" | "subcategory" | "title" | "description" | "colorFamily" | "brand" | "locations" | "eventStart" | "eventEnd"
> & { displayStatus?: PublicReport["displayStatus"] };

/** Public facts about a report – never contact or private details. */
export function ReportSummary({ report, compact = false }: { report: Summarisable; compact?: boolean }) {
  const cat = CATEGORY_INFO[report.category];
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={report.type} />
        {report.displayStatus && <StatusBadge status={report.displayStatus} />}
        <span className="text-xs text-stone-500">
          {cat.icon} {SUBCATEGORY_LABELS[report.subcategory]}
        </span>
      </div>
      <h3 className="mt-1.5 font-semibold text-stone-900">{report.title}</h3>
      {report.description && !compact && <p className="mt-0.5 text-sm text-stone-600">{report.description}</p>}
      <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 text-xs text-stone-500">
        <dt>{report.type === "LOST" ? "When" : "Found"}</dt>
        <dd className="text-stone-700">{formatEventTime(report)}</dd>
        <dt>Where</dt>
        <dd className="text-stone-700">{report.locations.map(locationLabel).join(", ")}</dd>
        <dt>Colour</dt>
        <dd className="flex items-center gap-1.5 text-stone-700">
          {report.colorFamily !== "UNKNOWN" && (
            <span className="inline-block h-3 w-3 rounded-full ring-1 ring-stone-300" style={{ background: COLOR_INFO[report.colorFamily].swatch }} />
          )}
          {COLOR_INFO[report.colorFamily].label}
          {report.brand ? ` · ${report.brand}` : ""}
        </dd>
      </dl>
    </div>
  );
}
