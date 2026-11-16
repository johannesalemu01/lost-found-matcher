import { cx } from "@/utils/cx";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-accent-600 text-white hover:bg-accent-700 disabled:bg-stone-300",
    secondary: "bg-white text-stone-800 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 disabled:text-stone-400",
    ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900 disabled:text-stone-300",
    danger: "bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50 disabled:text-stone-400",
  }[variant];
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        styles,
        className,
      )}
    />
  );
}
