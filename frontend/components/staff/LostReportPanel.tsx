"use client";

import { useEffect, useState } from "react";
import { SUBCATEGORY_LABELS, locationLabel, COLOR_INFO } from "@lf/shared";
import type { StaffMatch, StaffMatchGroup } from "@/interfaces";
import { formatEventTime, timeAgo } from "@/utils/format";
import { Button, Card } from "@/components/ui";
import { MatchCard } from "./MatchCard";
import { StaffPhoto } from "./StaffPhoto";

/** The selected lost report (shown once) and its candidate found items. */
export function LostReportPanel({
  group,
  expandWeak,
  busyKey,
  onBack,
  onConfirm,
  onReject,
  onClose,
}: {
  group: StaffMatchGroup;
  expandWeak: boolean;
  busyKey: string | null;
  onBack: () => void;
  onConfirm: (m: StaffMatch) => void;
  onReject: (m: StaffMatch) => void;
  onClose: () => void;
}) {
  const { lost, matches } = group;
  const [showWeak, setShowWeak] = useState(false);
  useEffect(() => setShowWeak(false), [lost.id]);

  const visible = matches.filter((m) => m.band !== "WEAK" || expandWeak || showWeak);
  const hiddenWeak = matches.length - visible.length;

  return (
    <section aria-label={`Candidates for ${lost.title}`} className="space-y-4">
      <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-800 lg:hidden">
        ← All lost reports
      </button>

      {/* The lost report, once */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-rose-700">Lost</span>
            <h2 className="mt-1.5 text-lg font-semibold text-stone-900">{lost.title}</h2>
            {lost.description && <p className="mt-0.5 text-sm text-stone-600">{lost.description}</p>}
          </div>
          <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={onClose} disabled={busyKey === lost.id}>
            Close report
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-4">
          <dl className="grid flex-1 grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-stone-500">Item</dt>
            <dd className="text-stone-800">{SUBCATEGORY_LABELS[lost.subcategory]}</dd>
            <dt className="text-stone-500">When</dt>
            <dd className="text-stone-800">{formatEventTime(lost)}</dd>
            <dt className="text-stone-500">Where</dt>
            <dd className="text-stone-800">{lost.locations.map(locationLabel).join(", ")}</dd>
            <dt className="text-stone-500">Colour</dt>
            <dd className="text-stone-800">
              {COLOR_INFO[lost.colorFamily].label}
              {lost.brand ? ` · ${lost.brand}` : ""}
            </dd>
            <dt className="text-stone-500">Owner</dt>
            <dd className="text-stone-800">
              {lost.contactName} · <span className="text-stone-600">{lost.contactEmailOrPhone}</span>
            </dd>
            <dt className="text-stone-500">Reported</dt>
            <dd className="text-stone-800">{timeAgo(lost.createdAt)}</dd>
          </dl>
          {lost.hasPhoto && (
            <StaffPhoto reportId={lost.id} alt={`Owner's photo of ${lost.title}`} className="h-28 w-36 rounded-lg ring-1 ring-stone-200" />
          )}
        </div>
      </Card>

      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          {matches.length} possible found item{matches.length === 1 ? "" : "s"}
        </h3>
        <p className="text-xs text-stone-400">Best match first</p>
      </div>

      {visible.map((m) => (
        <MatchCard
          key={m.foundId}
          lost={lost}
          match={m}
          busy={busyKey === m.lostId + m.foundId}
          onConfirm={() => onConfirm(m)}
          onReject={() => onReject(m)}
        />
      ))}
      {hiddenWeak > 0 && (
        <button
          className="w-full rounded-xl border border-dashed border-stone-300 py-3 text-sm text-stone-500 hover:bg-white"
          onClick={() => setShowWeak(true)}
        >
          Show {hiddenWeak} weak match{hiddenWeak === 1 ? "" : "es"}
        </button>
      )}
    </section>
  );
}
