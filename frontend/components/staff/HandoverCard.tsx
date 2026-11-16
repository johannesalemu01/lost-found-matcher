"use client";

import { useState } from "react";
import type { AwaitingHandover } from "@/interfaces";
import { formatDateTime } from "@/utils/format";
import { Button, Card } from "@/components/ui";
import { ContactLine } from "./ContactLine";
import { PrivateDetails } from "./PrivateDetails";

/** A confirmed pair: "Mark returned" stays disabled until the verification box is ticked. */
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
  return (
    <Card className="border-amber-200 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-stone-600">
          <span className="font-semibold text-stone-900">{match.lost.title}</span> ↔ <span className="font-semibold text-stone-900">{match.found.title}</span>
        </p>
        <p className="text-xs text-stone-500">Confirmed {formatDateTime(match.confirmedAt)}</p>
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <PrivateDetails lost={match.lost} found={match.found} />
          <ContactLine report={match.lost} />
        </div>
        <div className="space-y-3">
          <p className="rounded-lg bg-stone-50 p-3 text-sm font-medium text-stone-700">💬 {match.verificationQuestion}</p>
          <label className="flex cursor-pointer items-start gap-2 font-normal">
            <input type="checkbox" className="mt-0.5" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
            <span className="text-sm text-stone-700">Owner answered the verification question correctly</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onReturned} disabled={!verified || busy} title={verified ? undefined : "Tick the verification box first"}>
              Mark returned
            </Button>
            <Button variant="ghost" onClick={onUndo} disabled={busy}>
              Undo match
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
