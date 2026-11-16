"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_INFO, COLOR_INFO, locationLabel, type PublicReport } from "@lf/shared";
import { reportsService } from "@/services";
import { timeAgo } from "@/utils/format";
import { Card } from "@/components/ui";

const SHOW = 4;

/** The newest open found items – public details only – so people can check quickly. */
export function RecentFound() {
  const [items, setItems] = useState<PublicReport[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    reportsService
      .list({ type: "FOUND", status: "OPEN" })
      .then((r) => setItems((r.reports as PublicReport[]).sort((a, b) => b.eventStart.localeCompare(a.eventStart)).slice(0, SHOW)))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  return (
    <section className="space-y-3" aria-labelledby="recent-found">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="recent-found" className="text-lg font-semibold text-stone-900">
          Recently found on campus
        </h2>
        <Link href="/reports" className="text-sm font-medium text-accent-700 hover:underline">
          Browse all →
        </Link>
      </div>

      {!items ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: SHOW }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-stone-200/60" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-stone-500">Nothing has been handed in recently.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((r) => (
            <Card key={r.id} className="flex flex-col p-4">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span aria-hidden className="text-base">
                  {CATEGORY_INFO[r.category].icon}
                </span>
                <span>Found {timeAgo(r.eventStart)}</span>
              </div>
              <h3 className="mt-2 line-clamp-2 font-medium text-stone-900">{r.title}</h3>
              <p className="mt-auto pt-2 text-xs text-stone-500">
                {r.colorFamily !== "UNKNOWN" && (
                  <span
                    className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle ring-1 ring-stone-300"
                    style={{ background: COLOR_INFO[r.colorFamily].swatch }}
                  />
                )}
                {r.locations.map(locationLabel).join(", ")}
              </p>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-stone-500">Recognise something? Report it as lost – staff will verify it’s yours before handover.</p>
    </section>
  );
}
