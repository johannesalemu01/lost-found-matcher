"use client";

import { useState } from "react";
import type { MatchBand } from "@lf/shared";
import { useRole } from "@/context/RoleContext";
import { useStaffMatches } from "@/hooks/useStaffMatches";
import { matchesService, reportsService } from "@/services";
import { cx } from "@/utils/cx";
import { Button, EmptyState, ErrorState, Spinner } from "@/components/ui";
import { HandoverCard } from "./HandoverCard";
import { LostGroup } from "./LostGroup";

const FILTERS: { value: MatchBand | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "STRONG", label: "Strong" },
  { value: "POSSIBLE", label: "Possible" },
  { value: "WEAK", label: "Weak" },
];

export function StaffReviewPage() {
  const { role, ready, setRole } = useRole();
  const [band, setBand] = useState<MatchBand | "">("");
  const { data, error, busyKey, reload, run } = useStaffMatches(band, ready && role === "staff");

  if (!ready) return <Spinner />;
  if (role !== "staff") {
    return (
      <EmptyState title="Staff only" icon="🔒">
        <p>This page shows private details for verification.</p>
        <Button className="mt-4" onClick={() => setRole("staff")}>
          Switch to Staff mode
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Match review</h1>
          <p className="mt-1 max-w-xl text-sm text-stone-600">
            Suggestions only – you decide. Compare the private details, ask the verification question, then confirm.
          </p>
        </div>
        <div className="inline-flex rounded-lg bg-stone-100 p-1" role="tablist" aria-label="Filter by band">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              role="tab"
              aria-selected={band === f.value}
              onClick={() => setBand(f.value)}
              className={cx(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                band === f.value ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <Spinner label="Scoring reports…" />
      ) : (
        <>
          {data.awaitingHandover.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Confirmed – awaiting handover ({data.awaitingHandover.length})
              </h2>
              {data.awaitingHandover.map((m) => {
                const key = m.lostId + m.foundId;
                return (
                  <HandoverCard
                    key={key}
                    match={m}
                    busy={busyKey === key}
                    onUndo={() => run(key, () => matchesService.undo(m.lostId, m.foundId), "Match undone – both reports are open again.")}
                    onReturned={() => run(key, () => matchesService.markReturned(m.lostId, m.foundId), "Marked as returned. 🎉")}
                  />
                );
              })}
            </section>
          )}

          <section className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Suggested matches</h2>
            {data.groups.length === 0 ? (
              <EmptyState title={band ? `No ${band.toLowerCase()} matches right now` : "No suggestions right now"} icon="✨">
                New reports are matched automatically as they come in.
              </EmptyState>
            ) : (
              data.groups.map((g) => (
                <LostGroup
                  key={g.lost.id}
                  lost={g.lost}
                  matches={g.matches}
                  expandWeak={band === "WEAK"}
                  busy={busyKey}
                  onConfirm={(m) =>
                    run(
                      m.lostId + m.foundId,
                      () => matchesService.confirm(m.lostId, m.foundId),
                      "Match confirmed – both reports are now pending handover.",
                      () => matchesService.undo(m.lostId, m.foundId),
                    )
                  }
                  onReject={(m) =>
                    run(
                      m.lostId + m.foundId,
                      () => matchesService.reject(m.lostId, m.foundId),
                      "Marked as not a match. It won’t be suggested again.",
                      () => matchesService.undo(m.lostId, m.foundId),
                    )
                  }
                  onClose={() => run(g.lost.id, () => reportsService.close(g.lost.id), "Report closed.")}
                />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
