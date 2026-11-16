import { CATEGORY_INFO, locationLabel } from "@lf/shared";
import type { StaffMatchGroup } from "@/interfaces";
import { cx } from "@/utils/cx";
import { timeAgo } from "@/utils/format";
import { BandBadge } from "@/components/ui";

/** The review queue: one row per lost report, best match first. */
export function LostReportList({
  groups,
  selectedId,
  onSelect,
}: {
  groups: StaffMatchGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Lost reports with suggestions" className="space-y-2">
      {groups.map(({ lost, matches }) => {
        const best = matches[0];
        const selected = lost.id === selectedId;
        return (
          <button
            key={lost.id}
            onClick={() => onSelect(lost.id)}
            aria-current={selected ? "true" : undefined}
            className={cx(
              "w-full rounded-xl border bg-white p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
              selected ? "border-accent-500 ring-1 ring-accent-500" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate font-medium text-stone-900">
                <span aria-hidden className="mr-1">
                  {CATEGORY_INFO[lost.category].icon}
                </span>
                {lost.title}
              </p>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-stone-700">{best.score}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              {lost.locations.map(locationLabel).join(", ")} · reported {timeAgo(lost.createdAt)}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <BandBadge band={best.band} />
              <span className="text-xs text-stone-500">
                {matches.length} candidate{matches.length === 1 ? "" : "s"}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
