"use client";

import { useState } from "react";
import type { Report } from "@lf/shared";
import type { StaffMatch } from "@/interfaces";
import { Button } from "@/components/ui";
import { MatchCard } from "./MatchCard";

/** All suggestions for one lost report. Weak matches are collapsed unless asked for. */
export function LostGroup({
  lost,
  matches,
  expandWeak,
  busy,
  onConfirm,
  onReject,
  onClose,
}: {
  lost: Report;
  matches: StaffMatch[];
  expandWeak: boolean;
  busy: string | null;
  onConfirm: (m: StaffMatch) => void;
  onReject: (m: StaffMatch) => void;
  onClose: () => void;
}) {
  const [showWeak, setShowWeak] = useState(false);
  const visible = matches.filter((m) => m.band !== "WEAK" || expandWeak || showWeak);
  const hiddenWeak = matches.length - visible.length;

  return (
    <div className="rounded-2xl bg-stone-100/70 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-sm text-stone-600">
          Lost: <span className="font-semibold text-stone-900">{lost.title}</span> · {matches.length} candidate{matches.length === 1 ? "" : "s"}
        </p>
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose} disabled={busy === lost.id}>
          Close lost report
        </Button>
      </div>
      <div className="mt-3 space-y-3">
        {visible.map((m) => (
          <MatchCard key={m.foundId} lost={lost} match={m} busy={busy === m.lostId + m.foundId} onConfirm={() => onConfirm(m)} onReject={() => onReject(m)} />
        ))}
        {hiddenWeak > 0 && (
          <button className="w-full rounded-lg border border-dashed border-stone-300 py-2 text-sm text-stone-500 hover:bg-white" onClick={() => setShowWeak(true)}>
            Show {hiddenWeak} weak match{hiddenWeak === 1 ? "" : "es"}
          </button>
        )}
      </div>
    </div>
  );
}
