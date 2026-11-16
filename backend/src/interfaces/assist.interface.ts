import type { ClarityLevel, ExtractedFields } from "../matching";

/** Whether a suggestion came from the optional AI or from the rule-based fallback. */
export type AssistSource = "ai" | "rules";

/** Response of POST /api/assist/extract. */
export type SuggestedFields = ExtractedFields & { source: AssistSource };

/** Response of POST /api/assist/clarity (also embedded in POST /api/reports). */
export interface ClarityResponse {
  level: ClarityLevel;
  questions: string[];
  source: AssistSource;
}
