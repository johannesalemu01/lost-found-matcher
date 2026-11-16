import { normalize, stem } from "./normalize";
import { ITEM_CONCEPTS } from "./concepts";
import type { ColorFamily, Subcategory } from "@lf/shared";

export interface ExtractedFields {
  subcategory: Subcategory | null;
  colorFamily: ColorFamily | null;
  brand: string | null;
  /** Distinguishing words worth keeping in the description (stickers, engraving, contents…). */
  features: string[];
}

/** Words that name a specific subcategory. Two-word phrases are checked first. */
const SUBCATEGORY_PHRASES: Record<string, Subcategory> = {
  "laptop bag": "LAPTOP_BAG",
  "laptop sleeve": "LAPTOP_BAG",
  "student id": "STUDENT_ID",
  "student card": "STUDENT_ID",
  "campus card": "STUDENT_ID",
  "id card": "STUDENT_ID",
  "national id": "NATIONAL_ID",
  "air pod": "EARBUDS_HEADPHONES",
  "power bank": "CHARGER_CABLE",
  "water bottle": "BOTTLE_FLASK",
  "key chain": "KEYS",
};

const SUBCATEGORY_WORDS: Record<string, Subcategory> = {
  phone: "PHONE",
  iphone: "PHONE",
  smartphone: "PHONE",
  mobile: "PHONE",
  airpod: "EARBUDS_HEADPHONES",
  earbud: "EARBUDS_HEADPHONES",
  earphone: "EARBUDS_HEADPHONES",
  headphone: "EARBUDS_HEADPHONES",
  headset: "EARBUDS_HEADPHONES",
  laptop: "LAPTOP_TABLET",
  macbook: "LAPTOP_TABLET",
  tablet: "LAPTOP_TABLET",
  ipad: "LAPTOP_TABLET",
  charger: "CHARGER_CABLE",
  cable: "CHARGER_CABLE",
  adapter: "CHARGER_CABLE",
  backpack: "BACKPACK",
  rucksack: "BACKPACK",
  handbag: "HANDBAG",
  purse: "WALLET_PURSE",
  wallet: "WALLET_PURSE",
  bag: "OTHER_BAG",
  tote: "OTHER_BAG",
  passport: "NATIONAL_ID",
  key: "KEYS",
  keychain: "KEYS",
  jacket: "JACKET_HOODIE",
  hoodie: "JACKET_HOODIE",
  sweater: "JACKET_HOODIE",
  coat: "JACKET_HOODIE",
  scarf: "SCARF_HAT",
  hat: "SCARF_HAT",
  cap: "SCARF_HAT",
  beanie: "SCARF_HAT",
  bottle: "BOTTLE_FLASK",
  flask: "BOTTLE_FLASK",
  tumbler: "BOTTLE_FLASK",
  book: "BOOK_NOTEBOOK",
  notebook: "BOOK_NOTEBOOK",
  textbook: "BOOK_NOTEBOOK",
};

/**
 * Rule-based extraction – the fallback for the AI "Suggest fields" button.
 * The first item word wins: in "backpack containing a laptop charger" the item is the backpack.
 */
export function extractFields(text: string): ExtractedFields {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(stem);

  let subcategory: Subcategory | null = null;
  for (let i = 0; i < words.length && !subcategory; i++) {
    subcategory = SUBCATEGORY_PHRASES[`${words[i]} ${words[i + 1]}`] ?? SUBCATEGORY_WORDS[words[i]] ?? null;
  }

  const norm = normalize(text);
  const colorFamily = norm.colours[0]?.family ?? null;
  const brand = norm.brands[0] ?? null;
  const brandTokens = new Set(norm.brands.map((b) => b.toLowerCase().replace(/\s+/g, "")));
  const features = norm.tokens.filter((t) => !ITEM_CONCEPTS.has(t) && !brandTokens.has(t)).slice(0, 6);

  return { subcategory, colorFamily, brand, features };
}
