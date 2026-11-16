import type { DisplayStatus, MatchBand } from "@lf/shared";
import { cx } from "@/utils/cx";
import { BAND_STYLES } from "./styles";

const STATUS_STYLES: Record<DisplayStatus, { label: string; cls: string }> = {
  OPEN: { label: "Open", cls: "bg-sky-50 text-sky-800 ring-sky-200" },
  MATCH_PENDING: { label: "Match pending", cls: "bg-amber-50 text-amber-800 ring-amber-200" },
  RETURNED: { label: "Returned", cls: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  CLOSED: { label: "Closed", cls: "bg-stone-100 text-stone-600 ring-stone-200" },
  EXPIRED: { label: "Expired", cls: "bg-stone-100 text-stone-500 ring-stone-200" },
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const s = STATUS_STYLES[status];
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", s.cls)}>{s.label}</span>;
}

export function TypeBadge({ type }: { type: "LOST" | "FOUND" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        type === "LOST" ? "bg-rose-50 text-rose-700" : "bg-accent-50 text-accent-700",
      )}
    >
      {type === "LOST" ? "Lost" : "Found"}
    </span>
  );
}

export function BandBadge({ band }: { band: MatchBand | null }) {
  if (!band) return null;
  const s = BAND_STYLES[band];
  return <span className={cx("rounded-md px-2 py-0.5 text-xs font-semibold", s.badge)}>{s.label} match</span>;
}
