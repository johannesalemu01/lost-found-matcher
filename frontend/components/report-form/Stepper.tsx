import { cx } from "@/utils/cx";

export function Stepper({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="mt-6 flex items-center gap-2 text-sm" aria-label="Progress">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span
            className={cx(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
              i < current
                ? "bg-accent-600 text-white"
                : i === current
                  ? "bg-accent-100 text-accent-800 ring-2 ring-accent-600"
                  : "bg-stone-200 text-stone-500",
            )}
            aria-current={i === current ? "step" : undefined}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span className={cx("hidden truncate sm:inline", i === current ? "font-medium text-stone-900" : "text-stone-500")}>
            {label}
          </span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-stone-200" />}
        </li>
      ))}
    </ol>
  );
}
