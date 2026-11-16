"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRole } from "@/context/RoleContext";
import type { StatsResponse } from "@/interfaces";
import { statsService } from "@/services";

/** Open lost, open found, strong matches waiting. */
export function StatsRow() {
  const { role } = useRole();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    statsService.get().then(setStats).catch(() => setError(true));
  }, []);

  const items = [
    { label: "Open lost reports", value: stats?.openLost },
    { label: "Open found reports", value: stats?.openFound },
    { label: "Strong matches waiting", value: stats?.strongMatches, href: role === "staff" ? "/staff/matches" : undefined },
  ];

  return (
    <>
      <section aria-label="Current numbers" className="grid grid-cols-3 gap-3">
        {items.map((s) => {
          const body = (
            <>
              <div className="text-2xl font-semibold tabular-nums text-stone-900 sm:text-3xl">
                {error ? "–" : s.value ?? <span className="inline-block h-7 w-8 animate-pulse rounded bg-stone-200" />}
              </div>
              <div className="mt-1 text-xs text-stone-500 sm:text-sm">{s.label}</div>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="rounded-xl border border-stone-200 bg-white p-4 hover:border-accent-200">
              {body}
            </Link>
          ) : (
            <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
              {body}
            </div>
          );
        })}
      </section>
      {error && <p className="text-sm text-red-700">Couldn’t load the numbers. Is the backend running?</p>}
    </>
  );
}
