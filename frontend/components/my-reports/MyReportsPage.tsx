"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { DEMO_CONTACTS, STORAGE_KEYS } from "@/config/constants";
import type { MyReportItem } from "@/interfaces";
import { ApiError, reportsService } from "@/services";
import { GROUP_INFO, reportProgress, type ReportGroup } from "@/utils/report-progress";
import { readStorage, writeStorage } from "@/utils/storage";
import { Button, Card, EmptyState, ErrorState, FieldError, PageHeader, Spinner } from "@/components/ui";
import { MyReportCard } from "./MyReportCard";

const GROUP_ORDER: ReportGroup[] = ["ready", "progress", "finished"];

export function MyReportsPage() {
  const [contact, setContact] = useState("");
  const [lookedUp, setLookedUp] = useState<string | null>(null);
  const [reports, setReports] = useState<MyReportItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  async function lookup(value: string) {
    setLoading(true);
    setError(null);
    setFieldError(undefined);
    try {
      const res = await reportsService.mine(value);
      setReports(res.reports);
      setLookedUp(value);
      writeStorage(STORAGE_KEYS.contact, value);
    } catch (e) {
      if (e instanceof ApiError && e.fields.contact) setFieldError(e.fields.contact);
      else setError(e instanceof Error ? e.message : "Couldn’t load your reports");
      setReports(null);
    } finally {
      setLoading(false);
    }
  }

  // Remember the last contact used on this device (convenience only).
  useEffect(() => {
    const saved = readStorage(STORAGE_KEYS.contact);
    if (saved) {
      setContact(saved);
      lookup(saved);
    }
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (contact.trim()) lookup(contact.trim());
    else setFieldError("Enter the email or phone you used on your report");
  }

  const grouped = useMemo(() => {
    const map: Record<ReportGroup, MyReportItem[]> = { ready: [], progress: [], finished: [] };
    for (const item of reports ?? []) map[reportProgress(item.report, item.matchCount).group].push(item);
    return map;
  }, [reports]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="My reports"
        description="Follow your lost and found reports. Use the email or phone number you gave when reporting."
      />

      <Card className="p-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex-1">
            <label htmlFor="my-contact" className="sr-only">
              Email or phone
            </label>
            <input
              id="my-contact"
              className="w-full"
              placeholder="you@university.edu or +251 9…"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              aria-invalid={!!fieldError}
            />
            <FieldError message={fieldError} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Looking…" : "Show my reports"}
          </Button>
        </form>
        <p className="mt-2 text-xs text-stone-400">Demo: try {DEMO_CONTACTS.join(" or ")}</p>
      </Card>

      {error && <ErrorState message={error} onRetry={() => lookup(contact)} />}
      {loading && !reports && <Spinner />}

      {reports && reports.length === 0 && (
        <EmptyState title="No reports for this email or phone" icon="📭">
          Check the spelling, or{" "}
          <Link className="text-accent-700 underline" href="/report/new?type=lost">
            report a lost item
          </Link>
          .
        </EmptyState>
      )}

      {reports && reports.length > 0 && (
        <>
          <p className="text-sm text-stone-500">
            {reports.length} report{reports.length === 1 ? "" : "s"} for <span className="font-medium text-stone-700">{lookedUp}</span>
          </p>
          {GROUP_ORDER.filter((g) => grouped[g].length > 0).map((g) => (
            <section key={g} className="space-y-3" aria-labelledby={`group-${g}`}>
              <div className="flex items-baseline justify-between gap-2">
                <h2 id={`group-${g}`} className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  {GROUP_INFO[g].title} <span className="text-stone-400">({grouped[g].length})</span>
                </h2>
                <p className="hidden text-xs text-stone-400 sm:block">{GROUP_INFO[g].hint}</p>
              </div>
              {grouped[g].map((item) => (
                <MyReportCard key={item.report.id} item={item} />
              ))}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
