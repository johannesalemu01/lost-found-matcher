import type { ClarityResponse } from "@/interfaces";
import { cx } from "@/utils/cx";

const STYLES = {
  vague: { box: "border-amber-200 bg-amber-50 text-amber-900", label: "A bit vague – matches will be weaker", dot: "bg-amber-500" },
  ok: { box: "border-stone-200 bg-stone-50 text-stone-700", label: "Good – one more detail would help", dot: "bg-sky-500" },
  good: { box: "border-emerald-200 bg-emerald-50 text-emerald-900", label: "Great description", dot: "bg-emerald-500" },
} as const;

/** Live description-quality hint with follow-up questions. */
export function QualityHint({ clarity }: { clarity: ClarityResponse | null }) {
  if (!clarity) return null;
  const style = STYLES[clarity.level];
  return (
    <div className={cx("mt-3 rounded-lg border p-3 text-sm", style.box)} aria-live="polite">
      <p className="flex items-center gap-2 font-medium">
        <span className={cx("h-2 w-2 rounded-full", style.dot)} />
        {style.label}
      </p>
      {clarity.questions.length > 0 && (
        <ul className="mt-1.5 list-disc space-y-0.5 pl-6">
          {clarity.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
