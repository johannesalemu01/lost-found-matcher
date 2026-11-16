"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicReport } from "@lf/shared";
import { useRole } from "@/context/RoleContext";
import { useToast } from "@/context/ToastContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { StaffReport } from "@/interfaces";
import { reportsService } from "@/services";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { ReportCard } from "./ReportCard";
import { ReportFilters, type ReportFilterState } from "./ReportFilters";

export function BrowseReportsPage() {
  const { role, ready } = useRole();
  const toast = useToast();
  const [filters, setFilters] = useState<ReportFilterState>({ type: "LOST", q: "", category: "", status: "" });
  const q = useDebouncedValue(filters.q.trim(), 300);
  const [reports, setReports] = useState<(PublicReport | StaffReport)[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setReports(null);
    reportsService
      .list({ type: filters.type, q, category: filters.category, status: filters.status })
      .then((r) => setReports(r.reports))
      .catch((e) => setError(e.message));
  }, [filters.type, q, filters.category, filters.status]);

  useEffect(() => {
    if (ready) load();
  }, [load, ready, role]);

  async function close(id: string) {
    try {
      await reportsService.close(id);
      toast("Report closed.");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn’t close the report", { tone: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Browse reports</h1>
        <p className="mt-1 text-sm text-stone-600">
          Public listing – contact details and identifying details are never shown here.
          {role === "staff" && " You are in staff mode, so you also see them."}
        </p>
      </div>

      <ReportFilters value={filters} onChange={setFilters} />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !reports ? (
        <Spinner />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports match these filters" icon="🔎">
          Try another search or category.
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} onClose={close} />
          ))}
        </div>
      )}
    </div>
  );
}
