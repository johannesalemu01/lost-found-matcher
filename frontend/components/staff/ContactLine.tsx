import type { Report } from "@lf/shared";

export function ContactLine({ report }: { report: Report }) {
  return (
    <p className="mt-2 text-xs text-stone-500">
      {report.type === "LOST" ? "Owner" : "Finder"}: <span className="text-stone-700">{report.contactName}</span> · {report.contactEmailOrPhone}
    </p>
  );
}
