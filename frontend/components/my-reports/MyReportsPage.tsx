"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { DEMO_CONTACTS, STORAGE_KEYS } from "@/config/constants";
import type { MyReportItem } from "@/interfaces";
import { ApiError, reportsService } from "@/services";
import { readStorage, writeStorage } from "@/utils/storage";
import { Button, EmptyState, ErrorState, FieldError, Spinner } from "@/components/ui";
import { MyReportCard } from "./MyReportCard";

export function MyReportsPage() {
  const [contact, setContact] = useState("");
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">My reports</h1>
        <p className="mt-1 text-sm text-stone-600">Enter the email or phone number you used when reporting.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <input
            className="w-full"
            placeholder="you@university.edu or +251 9…"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            aria-label="Email or phone"
            aria-invalid={!!fieldError}
          />
          <FieldError message={fieldError} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Looking…" : "Show my reports"}
        </Button>
      </form>
      <p className="-mt-3 text-xs text-stone-400">Demo: try {DEMO_CONTACTS.join(" or ")}</p>

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
        <div className="space-y-3">
          {reports.map((item) => (
            <MyReportCard key={item.report.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
