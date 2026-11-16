"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ReportWizard } from "@/components/report-form/ReportWizard";

export default function NewReportPage() {
  return (
    <Suspense>
      <WithType />
    </Suspense>
  );
}

function WithType() {
  const type = useSearchParams().get("type") === "found" ? "FOUND" : "LOST";
  // key: switching lost <-> found starts a fresh form
  return <ReportWizard key={type} type={type} />;
}
