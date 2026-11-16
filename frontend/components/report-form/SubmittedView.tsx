"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { ReportType } from "@lf/shared";
import type { CreatedReportResponse } from "@/interfaces";
import { BandBadge, Card, ReasonList, ScoreBar } from "@/components/ui";
import { ReportSummary } from "@/components/reports/ReportSummary";

/** After submit: the matches we found and what happens next. No contact or private details are shown. */
export function SubmittedView({ type, result }: { type: ReportType; result: CreatedReportResponse }) {
  const shown = result.matches.filter((m) => m.band !== "WEAK");
  const weak = result.matches.length - shown.length;
  const n = shown.length;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl bg-accent-700 p-6 text-white">
        <p className="text-sm opacity-80">Report submitted ✓</p>
        <h1 className="mt-1 text-2xl font-semibold">
          {n === 0 ? "No likely matches yet" : `We found ${n} possible match${n === 1 ? "" : "es"}`}
        </h1>
        <p className="mt-2 text-sm opacity-90">
          {type === "LOST"
            ? "Staff will verify ownership and contact you. You’ll need to answer a question only the owner would know."
            : "Staff will verify the owner and contact you if they need anything. Please bring the item to the Lost & Found office."}
        </p>
      </div>

      {result.clarity.questions.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Your description is a bit thin. Staff may ask you:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {result.clarity.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Card>
      )}

      {n > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">Possible matches</h2>
          {shown.map((m) => (
            <Card key={m.other.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <BandBadge band={m.band} />
                <ScoreBar score={m.score} band={m.band} />
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <ReportSummary report={m.other} compact />
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500">Why we think so</p>
                  <ReasonList reasons={m.reasons} cap={m.cap} />
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
      {weak > 0 && <p className="text-sm text-stone-500">Plus {weak} weak match{weak === 1 ? "" : "es"} that staff will also look at.</p>}

      {n === 0 && (
        <p className="text-sm text-stone-600">
          {type === "LOST"
            ? "Every new found report is checked against yours automatically, so it’s worth checking back."
            : "Every new lost report is checked against yours automatically."}{" "}
          Reports stay open for 30 days.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/my-reports" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700">
          Follow it on My reports
        </Link>
        <Link href="/" className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50">
          Back home
        </Link>
      </div>
    </div>
  );
}
