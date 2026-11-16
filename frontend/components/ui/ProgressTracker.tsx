import { cx } from "@/utils/cx";

/**
 * Horizontal step tracker. `current` is the index of the step in progress;
 * steps before it are done. `stopped` greys it out (closed or expired).
 */
export function ProgressTracker({
  steps,
  current,
  stopped = false,
}: {
  steps: string[];
  current: number;
  stopped?: boolean;
}) {
  return (
    <ol className="flex items-start" aria-label="Progress">
      {steps.map((label, i) => {
        const done = !stopped && i < current;
        const active = !stopped && i === current;
        const last = i === steps.length - 1;
        return (
          <li key={label} className={cx("flex min-w-0 flex-1 flex-col", last && "flex-none")} aria-current={active ? "step" : undefined}>
            <div className="flex items-center">
              <span
                className={cx(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                  done && "bg-accent-600 text-white",
                  active && "bg-white text-accent-700 ring-2 ring-accent-600",
                  !done && !active && "bg-stone-200 text-stone-500",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              {!last && <span className={cx("mx-1 h-0.5 flex-1 rounded", done ? "bg-accent-600" : "bg-stone-200")} />}
            </div>
            <span
              className={cx(
                "mt-1.5 pr-2 text-[11px] leading-tight sm:text-xs",
                active ? "font-medium text-stone-900" : done ? "text-stone-600" : "text-stone-400",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
