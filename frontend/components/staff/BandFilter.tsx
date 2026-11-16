import type { MatchBand } from "@lf/shared";
import { cx } from "@/utils/cx";

export type BandFilterValue = MatchBand | "ALL";

const OPTIONS: { value: BandFilterValue; label: string; dot?: string }[] = [
  { value: "ALL", label: "All" },
  { value: "STRONG", label: "Strong", dot: "bg-emerald-500" },
  { value: "POSSIBLE", label: "Possible", dot: "bg-amber-500" },
  { value: "WEAK", label: "Weak", dot: "bg-stone-400" },
];

/** Summary counts that double as filters. */
export function BandFilter({
  value,
  counts,
  onChange,
}: {
  value: BandFilterValue;
  counts: Record<BandFilterValue, number>;
  onChange: (v: BandFilterValue) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Filter by match strength">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "rounded-xl border px-3 py-2 text-left transition-colors",
            value === o.value ? "border-accent-500 bg-white ring-1 ring-accent-500" : "border-stone-200 bg-white hover:border-stone-300",
          )}
        >
          <span className="block text-xl font-semibold tabular-nums text-stone-900">{counts[o.value]}</span>
          <span className="flex items-center gap-1.5 text-xs text-stone-500">
            {o.dot && <span className={cx("h-2 w-2 rounded-full", o.dot)} />}
            {o.label}
          </span>
        </button>
      ))}
    </div>
  );
}
