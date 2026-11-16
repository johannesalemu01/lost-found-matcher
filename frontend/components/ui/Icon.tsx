/** A few small inline icons (no icon library needed). */
const PATHS = {
  pin: "M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10Zm0-7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2",
  arrow: "M5 12h14m-5-5 5 5-5 5",
} as const;

export function Icon({ name, className = "h-3.5 w-3.5" }: { name: keyof typeof PATHS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
