"use client";

import { useMemo, useState } from "react";
import { useRole } from "@/context/RoleContext";
import { useStaffMatches } from "@/hooks/useStaffMatches";
import type { StaffMatch, StaffMatchGroup } from "@/interfaces";
import { matchesService, reportsService } from "@/services";
import { cx } from "@/utils/cx";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { StaffLoginForm } from "@/components/layout/StaffLoginForm";
import { BandFilter, type BandFilterValue } from "./BandFilter";
import { HandoverCard } from "./HandoverCard";
import { LostReportList } from "./LostReportList";
import { LostReportPanel } from "./LostReportPanel";

type Tab = "review" | "handover";

export function StaffReviewPage() {
  const { role, ready } = useRole();
  const { data, error, busyKey, reload, run } = useStaffMatches(ready && role === "staff");
  const [tab, setTab] = useState<Tab>("review");
  const [band, setBand] = useState<BandFilterValue>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);

  // Counts per band (across all groups) and the groups visible under the current filter.
  const { counts, groups } = useMemo(() => {
    const all = data?.groups ?? [];
    const counts = { ALL: 0, STRONG: 0, POSSIBLE: 0, WEAK: 0 };
    for (const g of all) for (const m of g.matches) {
      counts.ALL++;
      counts[m.band]++;
    }
    const groups: StaffMatchGroup[] =
      band === "ALL"
        ? all
        : all
            .map((g) => ({ ...g, matches: g.matches.filter((m) => m.band === band) }))
            .filter((g) => g.matches.length > 0);
    return { counts, groups };
  }, [data, band]);

  // Keep a valid selection: the chosen report if still listed, otherwise the first one.
  const selected = groups.find((g) => g.lost.id === selectedId) ?? groups[0] ?? null;

  if (!ready) return <Spinner />;
  if (role !== "staff") {
    return (
      <div className="mx-auto max-w-sm">
        <EmptyState title="Staff only" icon="🔒">
          <p>This page shows private details, contacts and photos. Sign in with the staff passcode.</p>
          <div className="mt-5 text-left">
            <StaffLoginForm autoFocus />
          </div>
        </EmptyState>
      </div>
    );
  }

  const confirm = (m: StaffMatch) =>
    run(m.lostId + m.foundId, () => matchesService.confirm(m.lostId, m.foundId), "Match confirmed – moved to Awaiting handover.", () =>
      matchesService.undo(m.lostId, m.foundId),
    );
  const reject = (m: StaffMatch) =>
    run(m.lostId + m.foundId, () => matchesService.reject(m.lostId, m.foundId), "Marked as not a match. It won’t be suggested again.", () =>
      matchesService.undo(m.lostId, m.foundId),
    );

  const handoverCount = data?.awaitingHandover.length ?? 0;
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "review", label: "Needs review", count: data?.groups.length ?? 0 },
    { id: "handover", label: "Awaiting handover", count: handoverCount },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-stone-900">Match review</h1>
        <p className="max-w-2xl text-sm text-stone-600">
          Suggestions only – you decide. Compare the private details and photos, ask the verification question, then confirm.
        </p>
      </header>

      <div className="flex gap-1 border-b border-stone-200" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setMobileDetail(false); // on phones, switching tab returns to the list
            }}
            className={cx(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium",
              tab === t.id ? "border-accent-600 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800",
            )}
          >
            {t.label}
            <span
              className={cx(
                "rounded-full px-2 py-0.5 text-xs tabular-nums",
                tab === t.id ? "bg-accent-100 text-accent-800" : "bg-stone-100 text-stone-600",
              )}
            >
              {data ? t.count : "–"}
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <Spinner label="Scoring reports…" />
      ) : tab === "handover" ? (
        handoverCount === 0 ? (
          <EmptyState title="Nothing waiting for collection" icon="📦">
            Confirmed matches appear here until the owner collects the item.
          </EmptyState>
        ) : (
          <div className="space-y-4">
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
          </div>
        )
      ) : (
        <div className="space-y-5">
          <BandFilter
            value={band}
            counts={counts}
            onChange={(b) => {
              setBand(b);
              setMobileDetail(false);
            }}
          />

          {groups.length === 0 ? (
            <EmptyState title={band === "ALL" ? "No suggestions right now" : `No ${band.toLowerCase()} matches right now`} icon="✨">
              New reports are matched automatically as they come in.
            </EmptyState>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
              <aside className={cx("lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1", mobileDetail && "hidden lg:block")}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Lost reports ({groups.length})
                </p>
                <LostReportList
                  groups={groups}
                  selectedId={selected?.lost.id ?? null}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setMobileDetail(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </aside>
              <div className={cx(!mobileDetail && "hidden lg:block")}>
                {selected && (
                  <LostReportPanel
                    group={selected}
                    expandWeak={band === "WEAK"}
                    busyKey={busyKey}
                    onBack={() => setMobileDetail(false)}
                    onConfirm={confirm}
                    onReject={reject}
                    onClose={() => run(selected.lost.id, () => reportsService.close(selected.lost.id), "Report closed.")}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
