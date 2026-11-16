import type { MatchBand } from "@lf/shared";
import { cx } from "@/utils/cx";
import { BAND_STYLES } from "./styles";

export function ScoreBar({ score, band }: { score: number; band: MatchBand | null }) {
  return (
    <div className="flex items-center gap-2" title={`Match score ${score} / 100`}>
      <div className="h-2 w-28 overflow-hidden rounded-full bg-stone-100" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label="Match score">
        <div className={cx("h-full rounded-full", band ? BAND_STYLES[band].bar : "bg-stone-300")} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums text-stone-700">{score}</span>
    </div>
  );
}
