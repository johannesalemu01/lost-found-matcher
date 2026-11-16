import {
  CATEGORY_INFO,
  SUBCATEGORY_LABELS,
  isCatchAll,
  parentOf,
  type Category,
  type ColorFamily,
  type ReportType,
  type Subcategory,
} from "@lf/shared";
import { ITEM_CONCEPTS } from "./concepts";
import { normalize } from "./normalize";

export interface ClarityInput {
  type: ReportType;
  subcategory?: Subcategory | null;
  title?: string;
  description?: string;
  colorFamily?: ColorFamily | null;
  brand?: string | null;
  /** Omit while the form has not reached the location step yet: location is then not checked. */
  locations?: string[];
}

export type ClarityLevel = "vague" | "ok" | "good";

export interface ClarityResult {
  level: ClarityLevel;
  /** 0–3 short follow-up questions, most useful first. */
  questions: string[];
}

const DETAIL_QUESTIONS: Record<Category, string> = {
  ELECTRONICS: "Does it have a case, stickers or a distinctive wallpaper? Which brand or model?",
  BAGS: "What was inside the bag? Any brand, patches or keyrings on it?",
  DOCUMENTS: "What kind of card or document is it, and was it in a holder or on a lanyard?",
  KEYS: "Is there a keychain? How many keys, and any fob or tag?",
  WALLET: "What is the wallet made of, and does it fold or zip? Any brand?",
  CLOTHING: "What size and brand is it? Any logo or print?",
  BOTTLE: "Any brand, stickers or dents on the bottle?",
  BOOKS: "What is the title or subject? Anything written on the cover?",
  OTHER: "What exactly is it – roughly how big, and what is it made of?",
};

const PARENT_NOUN: Record<Category, string> = {
  ELECTRONICS: "device",
  BAGS: "bag",
  DOCUMENTS: "card or document",
  KEYS: "keys",
  WALLET: "wallet",
  CLOTHING: "clothing",
  BOTTLE: "bottle",
  BOOKS: "book",
  OTHER: "item",
};

function typeQuestion(sub: Subcategory | null | undefined): string {
  if (!sub || sub === "OTHER") return "What exactly is the item (e.g. backpack, phone, keys)?";
  const parent = CATEGORY_INFO[parentOf(sub)];
  const options = parent.subcategories
    .filter((s) => s !== parent.otherSub)
    .map((s) => SUBCATEGORY_LABELS[s].toLowerCase());
  return `What kind of ${PARENT_NOUN[parent.id]} is it – ${options.join(", ")}?`;
}

/**
 * Rule-based "missing field checklist". Used as-is when there is no AI key,
 * and as the fallback whenever the AI call fails.
 *
 *   assessClarity({ type: "LOST", subcategory: "OTHER_BAG", description: "lost my bag somewhere", locations: ["NOT_SURE"] })
 *   // → { level: "vague", questions: ["What kind of bag is it – …?", "What colour is it…?", "Which places…?"] }
 */
export function assessClarity(input: ClarityInput): ClarityResult {
  const text = normalize(`${input.title ?? ""} ${input.description ?? ""}`);
  const detailTokens = text.tokens.filter((t) => !ITEM_CONCEPTS.has(t));
  const hasColour = (input.colorFamily && input.colorFamily !== "UNKNOWN") || text.colours.length > 0;
  const locations = input.locations;
  const hasLocation = locations === undefined || (locations.length > 0 && !locations.includes("NOT_SURE"));
  const parent: Category = input.subcategory ? parentOf(input.subcategory) : "OTHER";

  const questions: string[] = [];
  if (!input.subcategory || isCatchAll(input.subcategory)) questions.push(typeQuestion(input.subcategory));
  if (!hasColour) questions.push('What colour is it, roughly? "Dark" or "light" is fine.');
  if (!hasLocation) {
    questions.push(
      input.type === "LOST"
        ? "Which places did you visit while you still had it? Even a guess helps."
        : "Where exactly did you find it?",
    );
  }
  if (detailTokens.length < 2) questions.push(DETAIL_QUESTIONS[parent]);

  const missing = questions.length;
  const level: ClarityLevel = missing >= 2 ? "vague" : missing === 1 ? "ok" : "good";
  return { level, questions: questions.slice(0, 3) };
}
