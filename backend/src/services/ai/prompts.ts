import { COLOR_FAMILIES, SUBCATEGORIES, SUBCATEGORY_LABELS } from "@lf/shared";
import type { ClarityInput } from "../../matching";

/** Prompts ask for strict JSON in a fixed shape; the output is validated in assist.schemas.ts. */

export function extractionPrompt(text: string): string {
  return [
    "You help a university lost & found desk. Read the item description and suggest form fields.",
    "Reply with JSON only, exactly this shape:",
    '{"subcategory": <one of the ids below or null>, "colorFamily": <one of the ids below or null>, "brand": <string or null>, "features": [<up to 6 short distinguishing features>]}',
    `Subcategory ids: ${SUBCATEGORIES.map((s) => `${s} (${SUBCATEGORY_LABELS[s]})`).join(", ")}`,
    `Colour family ids: ${COLOR_FAMILIES.join(", ")}`,
    "Use null when unsure. Do not invent details that are not in the text.",
    `Description: """${text}"""`,
  ].join("\n");
}

export function clarityPrompt(input: ClarityInput, missing: string[]): string {
  return [
    "You help a university lost & found desk. A student wrote this report.",
    `Type: ${input.type}. Item: ${input.subcategory ? SUBCATEGORY_LABELS[input.subcategory] : "unknown"}.`,
    `Description: """${input.title ?? ""}. ${input.description ?? ""}"""`,
    `Fields that look missing: ${missing.join(", ") || "none"}.`,
    "Ask 1-3 short, friendly follow-up questions that would help match it with another person's report",
    "(e.g. colour, contents, stickers, where they had it last). Never ask for names, ID numbers or contact details.",
    'If the description is already specific, return an empty list. Reply with JSON only: {"questions": [..]}',
  ].join("\n");
}

export function photoExtractionPrompt(): string {
  return [
    "You help a university lost & found desk. Look at the photo of a personal item and suggest form fields.",
    "Reply with JSON only, exactly this shape:",
    '{"subcategory": <one of the ids below or null>, "colorFamily": <one of the ids below or null>, "brand": <string or null>, "features": [<up to 6 short visible distinguishing features, e.g. "cat sticker on lid">]}',
    `Subcategory ids: ${SUBCATEGORIES.map((s) => `${s} (${SUBCATEGORY_LABELS[s]})`).join(", ")}`,
    `Colour family ids: ${COLOR_FAMILIES.join(", ")}`,
    "Describe only the item. Ignore people, faces, screens and any text that looks like a name, ID number or address.",
    "Use null when unsure.",
  ].join("\n");
}
