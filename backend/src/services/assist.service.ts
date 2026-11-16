import type { ClarityResponse, SuggestedFields } from "../interfaces";
import { assessClarity, extractFields, type ClarityInput } from "../matching";
import { aiClaritySchema, aiExtractionSchema } from "../validators/assist.validator";
import { generateJson } from "./ai/gemini.client";
import { clarityPrompt, extractionPrompt, photoExtractionPrompt } from "./ai/prompts";
import { assertImage } from "./photo.service";

/** a) Suggest form fields from free text. The person confirms every suggestion. */
export async function suggestFields(text: string): Promise<SuggestedFields> {
  if (text.trim().length >= 3) {
    const ai = await generateJson(extractionPrompt(text), aiExtractionSchema, "extract");
    if (ai) return { ...ai, colorFamily: ai.colorFamily === "UNKNOWN" ? null : ai.colorFamily, source: "ai" };
  }
  return { ...extractFields(text), source: "rules" };
}

/**
 * a2) Suggest form fields from a photo. Needs the AI – there is no rule-based way to read an image,
 * so without a key (or on any failure) it returns empty suggestions with source "rules".
 * The photo is only sent when the person clicks the button, and it is not stored by this call.
 */
export async function suggestFieldsFromPhoto(photo: Buffer): Promise<SuggestedFields> {
  const mimeType = assertImage(photo);
  const ai = await generateJson(photoExtractionPrompt(), aiExtractionSchema, "extract-photo", { mimeType, data: photo });
  if (ai) return { ...ai, colorFamily: ai.colorFamily === "UNKNOWN" ? null : ai.colorFamily, source: "ai" };
  return { subcategory: null, colorFamily: null, brand: null, features: [], source: "rules" };
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
