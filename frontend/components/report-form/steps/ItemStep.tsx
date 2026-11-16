"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_INFO, COLOR_FAMILIES, COLOR_INFO, SUBCATEGORY_LABELS, parentOf } from "@lf/shared";
import { useToast } from "@/context/ToastContext";
import type { ClarityResponse, ExtractResponse, StepProps } from "@/interfaces";
import { assistService } from "@/services";
import { Button, Chip, FieldError } from "@/components/ui";
import { QualityHint } from "../QualityHint";
import { SuggestionPanel } from "../SuggestionPanel";

/** Step 1 – "What is it?": category → subcategory, title, description (+ helpers), colour, brand. */
export function ItemStep({ form, errors, isLost, set, update, clarity }: StepProps & { clarity: ClarityResponse | null }) {
  const toast = useToast();
  const [suggestion, setSuggestion] = useState<ExtractResponse | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const cat = form.category ? CATEGORY_INFO[form.category] : null;

  async function suggestFields() {
    const text = `${form.title}. ${form.description}`.trim();
    if (text.length < 5) {
      toast("Write a sentence about the item first.", { tone: "info" });
      return;
    }
    setSuggesting(true);
    try {
      const s = await assistService.extract(text);
      if (!s.subcategory && !s.colorFamily && !s.brand) {
        toast("No suggestions – try adding what it is and its colour.", { tone: "info" });
      }
      setSuggestion(s);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn’t get suggestions", { tone: "error" });
    } finally {
      setSuggesting(false);
    }
  }

  function applySuggestion(s: ExtractResponse) {
    update(
      {
        ...(s.subcategory ? { subcategory: s.subcategory, category: parentOf(s.subcategory) } : {}),
        ...(s.colorFamily ? { colorFamily: s.colorFamily } : {}),
        ...(s.brand && !form.brand ? { brand: s.brand } : {}),
      },
      ["subcategory"],
    );
    setSuggestion(null);
    toast("Fields filled in – please check them.");
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Category</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              selected={form.category === c}
              onClick={() => {
                const info = CATEGORY_INFO[c];
                const keepSub = form.subcategory && parentOf(form.subcategory) === c ? form.subcategory : null;
                // Single-item categories (Keys, Wallet…) need no second click.
                update({ category: c, subcategory: info.subcategories.length === 1 ? info.subcategories[0] : keepSub }, ["subcategory"]);
              }}
            >
              <span aria-hidden>{CATEGORY_INFO[c].icon}</span> {CATEGORY_INFO[c].label}
            </Chip>
          ))}
        </div>
        {cat && cat.subcategories.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2 rounded-lg bg-stone-50 p-3">
            {cat.subcategories.map((s) => (
              <Chip key={s} selected={form.subcategory === s} onClick={() => set("subcategory", s)}>
                {SUBCATEGORY_LABELS[s]}
              </Chip>
            ))}
          </div>
        )}
        <FieldError message={errors.subcategory} />
      </fieldset>

      <div>
        <label htmlFor="title">Short title</label>
        <input
          id="title"
          className="mt-1.5 w-full"
          maxLength={80}
          placeholder={isLost ? "e.g. Black backpack" : "e.g. Dark backpack"}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          aria-invalid={!!errors.title}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <div className="flex items-end justify-between gap-2">
          <label htmlFor="description">Description</label>
          <Button type="button" variant="ghost" className="px-2 py-1 text-xs" onClick={suggestFields} disabled={suggesting}>
            {suggesting ? "Thinking…" : "✨ Suggest fields"}
          </Button>
        </div>
        <textarea
          id="description"
          rows={4}
          maxLength={1000}
          className="mt-1.5 w-full"
          placeholder={cat ? cat.descriptionHint : "What is it? Brand, colour, stickers, contents…"}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <div className="mt-1 text-right text-xs text-stone-400">{form.description.length}/1000</div>
        {suggestion && <SuggestionPanel suggestion={suggestion} onApply={applySuggestion} onDismiss={() => setSuggestion(null)} />}
        <QualityHint clarity={clarity} />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Colour</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {COLOR_FAMILIES.map((c) => (
            <Chip key={c} selected={form.colorFamily === c} onClick={() => set("colorFamily", c)}>
              {c === "UNKNOWN" ? (
                <span className="inline-block h-3.5 w-3.5 rounded-full border border-dashed border-stone-400" />
              ) : (
                <span className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-stone-300" style={{ background: COLOR_INFO[c].swatch }} />
              )}
              {COLOR_INFO[c].label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="brand">
          Brand <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <input
          id="brand"
          className="mt-1.5 w-full sm:w-64"
          maxLength={50}
          value={form.brand}
          onChange={(e) => set("brand", e.target.value)}
          placeholder="e.g. Apple, JanSport"
        />
      </div>
    </div>
  );
}
