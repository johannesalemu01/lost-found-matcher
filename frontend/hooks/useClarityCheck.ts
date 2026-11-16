"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORY_INFO, type ReportType } from "@lf/shared";
import type { ClarityResponse, ReportFormState } from "@/interfaces";
import { assistService } from "@/services";

/**
 * Live "how useful is this description?" hint for the report form.
 * Debounced; uses the AI if the server has a key, keyword rules otherwise.
 */
export function useClarityCheck(type: ReportType, form: ReportFormState): ClarityResponse | null {
  const [clarity, setClarity] = useState<ClarityResponse | null>(null);

  const input = useMemo(
    () => ({
      type,
      text: `${form.title}\n${form.description}`,
      // Category chosen but not the exact type yet: treat it as "Other <category>".
      subcategory: form.subcategory ?? (form.category ? CATEGORY_INFO[form.category].otherSub ?? null : null),
      colorFamily: form.colorFamily,
      brand: form.brand,
      // Not chosen yet ≠ "Not sure": don't nag about places before the "Where & when?" step.
      locations: form.locations.length > 0 ? form.locations : undefined,
    }),
    [type, form.title, form.description, form.category, form.subcategory, form.colorFamily, form.brand, form.locations],
  );
  const hasSomething = Boolean(form.category) || form.description.trim().length >= 3;

  useEffect(() => {
    if (!hasSomething) {
      setClarity(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      assistService
        .clarity(input)
        .then((c) => !cancelled && setClarity(c))
        .catch(() => !cancelled && setClarity(null));
    }, 700);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [input, hasSomething]);

  return clarity;
}
