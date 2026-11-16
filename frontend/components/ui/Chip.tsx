import { cx } from "@/utils/cx";

export function Chip({
  selected,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...props}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        selected
          ? "border-accent-600 bg-accent-50 font-medium text-accent-800"
          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
