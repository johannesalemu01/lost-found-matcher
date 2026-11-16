import type { PublicReport } from "@lf/shared";
import type { StaffReport } from "@/interfaces";
import { timeAgo } from "@/utils/format";
import { Button, Card } from "@/components/ui";
import { StaffPhoto } from "@/components/staff/StaffPhoto";
import { ReportSummary } from "./ReportSummary";

/** A report in the browse list. Staff additionally see contact + private detail and can close it. */
export function ReportCard({ report, onClose }: { report: PublicReport | StaffReport; onClose?: (id: string) => void }) {
  const staff = "contactName" in report ? (report as StaffReport) : null;
  const closable = staff && (staff.status === "OPEN" || report.displayStatus === "EXPIRED");

  return (
    <Card className="flex flex-col p-4">
      <ReportSummary report={report} />
      {staff && (
        <div className="mt-3 space-y-1 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
          <p>
            <span className="font-medium text-stone-800">Contact:</span> {staff.contactName} · {staff.contactEmailOrPhone}
          </p>
          {staff.hasPhoto && (
            <StaffPhoto reportId={staff.id} alt={`Photo of ${staff.title}`} className="mt-1 h-24 w-32 rounded-md ring-1 ring-stone-200" />
          )}
          {staff.privateDetail && (
            <p>
              <span className="font-medium text-stone-800">🔒 Private detail:</span> {staff.privateDetail}
            </p>
          )}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between pt-3 text-xs text-stone-400">
        <span>Reported {timeAgo(report.createdAt)}</span>
        {closable && onClose && (
          <Button variant="danger" className="px-2.5 py-1 text-xs" onClick={() => onClose(report.id)}>
            Close report
          </Button>
        )}
      </div>
    </Card>
  );
}
