import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-xl border border-stone-200 bg-white shadow-card", className)}>{children}</div>;
}
