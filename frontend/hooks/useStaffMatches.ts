"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import type { StaffMatchesResponse } from "@/interfaces";
import { matchesService } from "@/services";

/**
 * Loads all suggestions + pairs awaiting handover (filtering by band happens in the UI so the
 * counts stay correct), and runs decisions with a refresh and an "Undo" toast where it makes sense.
 */
export function useStaffMatches(enabled: boolean) {
  const toast = useToast();
  const [data, setData] = useState<StaffMatchesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const reload = useCallback(() => {
    setError(null);
    return matchesService
      .list()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (enabled) reload();
  }, [enabled, reload]);

  const run = useCallback(
    async (key: string, action: () => Promise<unknown>, success: string, undo?: () => Promise<unknown>) => {
      setBusyKey(key);
      try {
        await action();
        toast(success, undo ? { action: { label: "Undo", onClick: () => run(key, undo, "Undone.") } } : undefined);
        await reload();
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
