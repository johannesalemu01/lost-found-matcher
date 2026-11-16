"use client";

import { useRole } from "@/context/RoleContext";
import { cx } from "@/utils/cx";
import type { Role } from "@/utils/storage";

/** Student / Staff switch – a demo stand-in for real authentication. */
export function RoleToggle() {
  const { role, setRole } = useRole();
  return (
    <div className="ml-auto flex items-center gap-2 text-xs">
      <span className="hidden text-stone-500 sm:inline">View as</span>
      <div className="inline-flex rounded-lg bg-stone-100 p-0.5" role="group" aria-label="Role">
        {(["student", "staff"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            aria-pressed={role === r}
            className={cx(
              "rounded-md px-3 py-1 font-medium capitalize transition-colors",
              role === r ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800",
            )}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
