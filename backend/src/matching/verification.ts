import { parentOf, type Category, type Subcategory } from "@lf/shared";

const QUESTIONS: Record<Category, string> = {
  ELECTRONICS: "what is on the back of the case, or on the lock screen?",
  BAGS: "what was inside the bag?",
  DOCUMENTS: "what name and number are on the card? Check it against another photo ID.",
  KEYS: "what is on the keychain, and how many keys are there?",
  WALLET: "which cards or items are inside the wallet?",
  CLOTHING: "what size and brand is it, and is anything in the pockets?",
  BOTTLE: "what stickers, dents or marks are on the bottle?",
  BOOKS: "what is written on the first page or inside the cover?",
  OTHER: "describe one detail that is not in the public description.",
};

/**
 * A question staff can ask the claimant before handover. It targets what a stranger
 * reading the public listing could not know.
 */
export function verificationQuestion(subcategory: Subcategory): string {
  if (subcategory === "EARBUDS_HEADPHONES") return "Ask the owner: what is on the back of the case?";
  return `Ask the owner: ${QUESTIONS[parentOf(subcategory)]}`;
}
