"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SUBCATEGORIES, type Subcategory } from "@lf/shared";
import { ReportWizard } from "@/components/report-form/ReportWizard";

export default function NewReportPage() {
  return (
    <Suspense>
      <WithType />
    </Suspense>
  );
}

function WithType() {
  const params = useSearchParams();
  const type = params.get("type") === "found" ? "FOUND" : "LOST";
  // Optional pre-selected item type, e.g. from "I found this" on a lost item's card.
  const sub = params.get("sub");
  const initialSubcategory = (SUBCATEGORIES as readonly string[]).includes(sub ?? "") ? (sub as Subcategory) : null;
  // key: switching lost <-> found (or the item type) starts a fresh form
  return <ReportWizard key={`${type}-${initialSubcategory}`} type={type} initialSubcategory={initialSubcategory} />;
}
