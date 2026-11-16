"use client";

import { useCallback, useEffect, useState } from "react";
import type { MatchBand } from "@lf/shared";
import { useToast } from "@/context/ToastContext";
import type { StaffMatchesResponse } from "@/interfaces";
import { matchesService } from "@/services";

/**
 * Loads the staff review data and runs decisions (confirm / reject / undo / returned / close),
 * refreshing afterwards and offering "Undo" in the toast where it makes sense.
 */
export function useStaffMatches(band: MatchBand | "", enabled: boolean) {
  const toast = useToast();
  const [data, setData] = useState<StaffMatchesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const reload = useCallback(() => {
    setError(null);
    matchesService
      .list(band || undefined)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [band]);

  useEffect(() => {
    if (!enabled) return;
    setData(null);
    reload();
  }, [enabled, reload]);

  const run = useCallback(
    async (key: string, action: () => Promise<unknown>, success: string, undo?: () => Promise<unknown>) => {
      setBusyKey(key);
      try {
        await action();
        toast(success, undo ? { action: { label: "Undo", onClick: () => run(key, undo, "Undone.") } } : undefined);
        reload();
      } catch (e) {
        toast(e instanceof Error ? e.message : "That didn’t work", { tone: "error" });
      } finally {
        setBusyKey(null);
      }
    },
    [toast, reload],
  );

  return { data, error, busyKey, reload, run };
}
