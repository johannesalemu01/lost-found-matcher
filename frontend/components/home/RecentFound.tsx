"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SUBCATEGORY_LABELS, locationLabel, type PublicReport } from "@lf/shared";
import { reportsService } from "@/services";
import { timeAgo } from "@/utils/format";
import { Icon } from "@/components/ui";
import { ItemTile } from "@/components/reports/ItemTile";

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
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-200/60" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-stone-500">Nothing has been handed in recently.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((r) => (
            <article
              key={r.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="h-1 bg-accent-500" />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start gap-3">
                  <ItemTile type="FOUND" category={r.category} colorFamily={r.colorFamily} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-700">{SUBCATEGORY_LABELS[r.subcategory]}</p>
                    <h3 className="line-clamp-2 text-sm font-semibold text-stone-900">{r.title}</h3>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-xs text-stone-500">
                  <li className="flex items-center gap-1.5">
                    <Icon name="pin" />
                    <span className="truncate">{r.locations.map(locationLabel).join(", ")}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon name="clock" />
                    <span>Found {timeAgo(r.eventStart)}</span>
                  </li>
                </ul>
                <Link
                  href={`/report/new?type=lost&sub=${r.subcategory}`}
                  className="mt-auto inline-flex items-center gap-1 self-start pt-3 text-xs font-medium text-rose-700 hover:underline"
                >
                  This is mine <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="text-xs text-stone-500">Recognise something? Tap “This is mine” – staff will verify it’s yours before handover.</p>
    </section>
  );
}
