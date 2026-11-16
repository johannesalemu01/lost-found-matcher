import { COLOR_INFO, SUBCATEGORY_LABELS } from "@lf/shared";
import type { ExtractResponse } from "@/interfaces";
import { Button } from "@/components/ui";

/** "Suggest fields" result – nothing is filled in until the person clicks "Use these". */
export function SuggestionPanel({
  suggestion,
  onApply,
  onDismiss,
}: {
  suggestion: ExtractResponse;
  onApply: (s: ExtractResponse) => void;
  onDismiss: () => void;
}) {
  if (!suggestion.subcategory && !suggestion.colorFamily && !suggestion.brand) return null;
  return (
    <div className="mt-2 rounded-lg border border-accent-200 bg-accent-50 p-3 text-sm">
      <p className="font-medium text-accent-800">
        Suggested {suggestion.source === "ai" ? "by AI" : "by keyword rules"} – check before using:
      </p>
      <ul className="mt-1 text-accent-800">
        {suggestion.subcategory && <li>Item: {SUBCATEGORY_LABELS[suggestion.subcategory]}</li>}
        {suggestion.colorFamily && <li>Colour: {COLOR_INFO[suggestion.colorFamily].label}</li>}
        {suggestion.brand && <li>Brand: {suggestion.brand}</li>}
        {suggestion.features.length > 0 && <li>Details noticed: {suggestion.features.join(", ")}</li>}
      </ul>
      <div className="mt-2 flex gap-2">
        <Button type="button" className="px-3 py-1 text-xs" onClick={() => onApply(suggestion)}>
          Use these
        </Button>
        <Button type="button" variant="ghost" className="px-3 py-1 text-xs" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
