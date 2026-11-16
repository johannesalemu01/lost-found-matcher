"use client";

import { useEffect, useState } from "react";
import { reportsService } from "@/services";
import { cx } from "@/utils/cx";

/**
 * A staff-only photo, fetched with the staff session cookie
 * and shown from an in-memory object URL (nothing is cached or made public).
 */
export function StaffPhoto({ reportId, alt, className }: { reportId: string; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    reportsService
      .photo(reportId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reportId]);

  if (failed) return <div className={cx("grid place-items-center bg-stone-100 text-xs text-stone-400", className)}>Photo unavailable</div>;
  if (!url) return <div className={cx("animate-pulse bg-stone-100", className)} aria-label="Loading photo" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" title="Open full size">
      {/* eslint-disable-next-line @next/next/no-img-element -- blob URL, not optimisable */}
      <img src={url} alt={alt} className={cx("object-cover", className)} />
    </a>
  );
}
