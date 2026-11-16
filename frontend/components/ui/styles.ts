import type { MatchBand } from "@lf/shared";

/** Strong = green, Possible = amber, Weak = grey – used by badges and score bars. */
export const BAND_STYLES: Record<MatchBand, { label: string; badge: string; bar: string }> = {
  STRONG: { label: "Strong", badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500" },
  POSSIBLE: { label: "Possible", badge: "bg-amber-100 text-amber-800", bar: "bg-amber-500" },
  WEAK: { label: "Weak", badge: "bg-stone-200 text-stone-700", bar: "bg-stone-400" },
};
