"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PublicReport } from "@lf/shared";
import { useRole } from "@/context/RoleContext";
import { useToast } from "@/context/ToastContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { StaffReport } from "@/interfaces";
import { reportsService } from "@/services";
import { Card, EmptyState, ErrorState, PageHeader, Spinner } from "@/components/ui";
import { ReportCard } from "./ReportCard";
import { ReportFilters, type ReportFilterState } from "./ReportFilters";

export function BrowseReportsPage() {
  const { role, ready } = useRole();
  const toast = useToast();
  const [filters, setFilters] = useState<ReportFilterState>({ type: "LOST", q: "", category: "", status: "OPEN" });
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
      <PageHeader
        title="Browse reports"
        description={
          role === "staff"
            ? "Staff view – contact details, private details and photos are shown."
            : "See what has been lost and found on campus. Contact and identifying details are never shown here."
        }
      />

      <Card className="p-4">
        <ReportFilters value={filters} onChange={setFilters} />
      </Card>

      {reports && reports.length > 0 && (
        <p className="text-sm text-stone-500" aria-live="polite">
          {reports.length} {filters.type === "LOST" ? "lost" : "found"} report{reports.length === 1 ? "" : "s"}
        </p>
      )}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !reports ? (
        <Spinner />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports match these filters" icon="🔎">
          Try another search, category or status.
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} onClose={close} />
          ))}
        </div>
      )}

      {role !== "staff" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-stone-300 px-5 py-4">
          <p className="text-sm text-stone-600">
            {filters.type === "LOST"
              ? "Found one of these – or anything else? Report it and we’ll match it to its owner."
              : "Don’t see what you lost? Report it – we’ll check every new found item against it."}
          </p>
          <Link
            href={filters.type === "LOST" ? "/report/new?type=found" : "/report/new?type=lost"}
            className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
          >
            {filters.type === "LOST" ? "I found something" : "I lost something"}
          </Link>
        </div>
      )}
    </div>
  );
}
