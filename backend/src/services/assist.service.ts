import type { ClarityResponse, SuggestedFields } from "../interfaces";
import { assessClarity, extractFields, type ClarityInput } from "../matching";
import { aiClaritySchema, aiExtractionSchema } from "../validators/assist.validator";
import { generateJson } from "./ai/gemini.client";
import { clarityPrompt, extractionPrompt } from "./ai/prompts";

/** a) Suggest form fields from free text. The person confirms every suggestion. */
export async function suggestFields(text: string): Promise<SuggestedFields> {
  if (text.trim().length >= 3) {
    const ai = await generateJson(extractionPrompt(text), aiExtractionSchema, "extract");
    if (ai) return { ...ai, colorFamily: ai.colorFamily === "UNKNOWN" ? null : ai.colorFamily, source: "ai" };
  }
  return { ...extractFields(text), source: "rules" };
}

/**
 * b) Follow-up questions for vague descriptions.
 * The rule-based checklist decides *whether* a report is vague; the AI may only phrase better questions.
 */
export async function clarityCheck(input: ClarityInput): Promise<ClarityResponse> {
  const rules = assessClarity(input);
  if (rules.questions.length === 0) return { ...rules, source: "rules" };

  const ai = await generateJson(clarityPrompt(input, rules.questions), aiClaritySchema, "clarity");
  if (ai && ai.questions.length > 0) return { level: rules.level, questions: ai.questions, source: "ai" };
  return { ...rules, source: "rules" };
}
