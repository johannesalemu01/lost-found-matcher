import Link from "next/link";
import { COLOR_INFO, SUBCATEGORY_LABELS, locationLabel, type PublicReport } from "@lf/shared";
import type { StaffReport } from "@/interfaces";
import { cx } from "@/utils/cx";
import { formatEventTime, timeAgo } from "@/utils/format";
import { Button, Icon, StatusBadge } from "@/components/ui";
import { StaffPhoto } from "@/components/staff/StaffPhoto";
import { ItemTile } from "./ItemTile";

/**
 * A lost or found item in the public listing. Staff additionally see the contact,
 * private detail and photo, and can close the report.
 */
export function ReportCard({ report, onClose }: { report: PublicReport | StaffReport; onClose?: (id: string) => void }) {
  const staff = "contactName" in report ? (report as StaffReport) : null;
  const lost = report.type === "LOST";
  const open = report.displayStatus === "OPEN";
  const closable = staff && (staff.status === "OPEN" || report.displayStatus === "EXPIRED");

  return (
    <article
      className={cx(
        "group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-card transition",
        "hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md",
      )}
    >
      {/* Coloured edge: rose = lost, teal = found */}
      <div className={cx("h-1", lost ? "bg-rose-400" : "bg-accent-500")} />

      <div className="flex gap-4 p-4 sm:p-5">
        <ItemTile type={report.type} category={report.category} colorFamily={report.colorFamily} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cx("text-[11px] font-semibold uppercase tracking-wider", lost ? "text-rose-600" : "text-accent-700")}>
                {lost ? "Lost" : "Found"} · {SUBCATEGORY_LABELS[report.subcategory]}
              </p>
              <h3 className="mt-0.5 truncate text-base font-semibold text-stone-900">{report.title}</h3>
            </div>
            {!open && <StatusBadge status={report.displayStatus} />}
          </div>

          {report.description && <p className="mt-1 line-clamp-2 text-sm text-stone-600">{report.description}</p>}

          <ul className="mt-3 space-y-1 text-xs text-stone-500">
            <li className="flex items-center gap-1.5">
              <Icon name="pin" />
              <span className="truncate">{report.locations.map(locationLabel).join(", ")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="clock" />
              <span className="truncate">{formatEventTime(report)}</span>
            </li>
          </ul>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {report.colorFamily !== "UNKNOWN" && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">{COLOR_INFO[report.colorFamily].label}</span>
            )}
            {report.brand && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">{report.brand}</span>}
          </div>
        </div>
      </div>

      {staff && (
        <div className="mx-4 mb-4 space-y-2 rounded-xl bg-stone-50 p-3 text-xs text-stone-600 sm:mx-5">
          <p>
            <span className="font-medium text-stone-800">Contact:</span> {staff.contactName} · {staff.contactEmailOrPhone}
          </p>
          {staff.privateDetail && (
            <p>
              <span className="font-medium text-stone-800">🔒 Private detail:</span> {staff.privateDetail}
            </p>
          )}
          {staff.hasPhoto && (
            <StaffPhoto reportId={staff.id} alt={`Photo of ${staff.title}`} className="h-24 w-32 rounded-md ring-1 ring-stone-200" />
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 px-4 py-2.5 sm:px-5">
        <span className="text-xs text-stone-400">Reported {timeAgo(report.createdAt)}</span>
        {staff ? (
          closable &&
          onClose && (
            <Button variant="danger" className="px-2.5 py-1 text-xs" onClick={() => onClose(report.id)}>
              Close report
            </Button>
          )
        ) : (
          open && (
            <Link
              href={`/report/new?type=${lost ? "found" : "lost"}&sub=${report.subcategory}`}
              className={cx(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                lost ? "text-accent-700 hover:bg-accent-50" : "text-rose-700 hover:bg-rose-50",
              )}
            >
              {lost ? "I found this" : "This is mine"}
              <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )
        )}
      </div>
    </article>
  );
}
