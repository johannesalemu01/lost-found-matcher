"use client";

import { useState } from "react";
import { locationLabel } from "@lf/shared";
import type { AwaitingHandover } from "@/interfaces";
import { formatDateTime } from "@/utils/format";
import { Button, Card } from "@/components/ui";
import { SectionLabel, VerifyPanel } from "./VerifyPanel";

/**
 * A confirmed pair waiting for the owner to collect it.
 * Step 1: ask the question. Step 2: tick. Step 3: mark returned (disabled until ticked).
 */
export function HandoverCard({
  match,
  busy,
  onUndo,
  onReturned,
}: {
  match: AwaitingHandover;
  busy: boolean;
  onUndo: () => void;
  onReturned: () => void;
}) {
  const [verified, setVerified] = useState(false);
  const { lost, found } = match;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-4 py-3 sm:px-5">
        <h3 className="font-semibold text-stone-900">
          {lost.title} <span className="font-normal text-stone-400">↔</span> {found.title}
        </h3>
        <p className="text-xs text-stone-500">Confirmed {formatDateTime(match.confirmedAt)}</p>
      </div>

      <div className="grid gap-5 px-4 py-4 sm:px-5 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <SectionLabel>Owner collecting</SectionLabel>
            <p className="text-sm text-stone-800">
              {lost.contactName} · <span className="text-stone-600">{lost.contactEmailOrPhone}</span>
            </p>
            <p className="text-xs text-stone-500">Lost near {lost.locations.map(locationLabel).join(", ")}</p>
          </div>
          <div className="space-y-1.5">
            <SectionLabel>Handed in by</SectionLabel>
            <p className="text-sm text-stone-800">
              {found.contactName} · <span className="text-stone-600">{found.contactEmailOrPhone}</span>
            </p>
            <p className="text-xs text-stone-500">Found at {found.locations.map(locationLabel).join(", ")}</p>
          </div>
        </div>
        <VerifyPanel lost={lost} found={found} question={match.verificationQuestion} />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-stone-100 bg-stone-50/60 px-4 py-3 sm:px-5">
        <label className="mr-auto flex cursor-pointer items-center gap-2 font-normal">
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
          <span className="text-sm text-stone-700">Owner answered the verification question correctly</span>
        </label>
        <Button variant="ghost" className="px-3 py-1.5" onClick={onUndo} disabled={busy}>
          Undo match
        </Button>
        <Button className="px-3 py-1.5" onClick={onReturned} disabled={!verified || busy} title={verified ? undefined : "Tick the verification box first"}>
          Mark returned
        </Button>
      </div>
    </Card>
  );
}
