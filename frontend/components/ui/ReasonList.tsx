import type { ScoreComponent } from "@lf/shared";
import { cx } from "@/utils/cx";

const KIND_ICON = { support: "✓", neutral: "•", conflict: "⚠" } as const;

const KIND_STYLE = {
  support: "text-emerald-700",
  neutral: "text-stone-400",
  conflict: "text-amber-600",
} as const;

export function ReasonList({ reasons, cap, showPoints = false }: { reasons: ScoreComponent[]; cap?: string | null; showPoints?: boolean }) {
  return (
    <ul className="space-y-1 text-sm">
      {reasons.map((r, i) => (
        <li key={i} className="flex gap-2">
          <span className={cx("w-4 shrink-0 text-center font-bold", KIND_STYLE[r.kind])} aria-label={r.kind}>
            {KIND_ICON[r.kind]}
          </span>
          <span className={cx("flex-1", r.kind === "conflict" ? "text-amber-800" : "text-stone-700")}>
            {r.reason.replace(/^⚠\s*/, "")}
          </span>
          {showPoints && r.max > 0 && (
            <span className="shrink-0 tabular-nums text-xs text-stone-400">
              {r.points}/{r.max}
            </span>
          )}
        </li>
      ))}
      {cap && <li className="pl-6 text-xs italic text-stone-500">{cap}</li>}
    </ul>
  );
}
