/**
 * Two-level category hierarchy. The parent is derived from the subcategory,
 * so a report only ever stores a consistent pair.
 *
 * Compatibility rules (used by the matching engine):
 *  - same subcategory                         -> compatible, full points
 *  - "Other <parent>" vs any sub of that parent -> compatible, but weaker (band capped at POSSIBLE)
 *  - top-level "Other" vs anything            -> compatible, but weaker (band capped at POSSIBLE)
 *  - anything else (e.g. Phone vs Earbuds)    -> NOT a match
 */

export const CATEGORIES = [
  "ELECTRONICS",
  "BAGS",
  "DOCUMENTS",
  "KEYS",
  "WALLET",
  "CLOTHING",
  "BOTTLE",
  "BOOKS",
  "OTHER",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SUBCATEGORIES = [
  "PHONE",
  "EARBUDS_HEADPHONES",
  "LAPTOP_TABLET",
  "CHARGER_CABLE",
  "OTHER_ELECTRONICS",
  "BACKPACK",
  "HANDBAG",
  "LAPTOP_BAG",
  "OTHER_BAG",
  "STUDENT_ID",
  "NATIONAL_ID",
  "OTHER_DOCUMENT",
  "KEYS",
  "WALLET_PURSE",
  "JACKET_HOODIE",
  "SCARF_HAT",
  "OTHER_CLOTHING",
  "BOTTLE_FLASK",
  "BOOK_NOTEBOOK",
  "OTHER",
] as const;
export type Subcategory = (typeof SUBCATEGORIES)[number];

export interface CategoryInfo {
  id: Category;
  label: string;
  icon: string; // emoji – no icon library needed
  subcategories: Subcategory[];
  /** The "Other <parent>" catch-all for this parent, if any. */
  otherSub?: Subcategory;
  /** Placeholder for the description field – nudges people towards useful details. */
  descriptionHint: string;
}

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  ELECTRONICS: {
    id: "ELECTRONICS",
    label: "Electronics",
    icon: "📱",
    subcategories: ["PHONE", "EARBUDS_HEADPHONES", "LAPTOP_TABLET", "CHARGER_CABLE", "OTHER_ELECTRONICS"],
    otherSub: "OTHER_ELECTRONICS",
    descriptionHint: "Brand, model, case, stickers, wallpaper?",
  },
  BAGS: {
    id: "BAGS",
    label: "Bags",
    icon: "🎒",
    subcategories: ["BACKPACK", "HANDBAG", "LAPTOP_BAG", "OTHER_BAG"],
    otherSub: "OTHER_BAG",
    descriptionHint: "What was inside? Brand, patches, keyrings?",
  },
  DOCUMENTS: {
    id: "DOCUMENTS",
    label: "Documents & cards",
    icon: "🪪",
    subcategories: ["STUDENT_ID", "NATIONAL_ID", "OTHER_DOCUMENT"],
    otherSub: "OTHER_DOCUMENT",
    descriptionHint: "Type of card, holder or lanyard? (Keep the name/number for the private field.)",
  },
  KEYS: {
    id: "KEYS",
    label: "Keys",
    icon: "🔑",
    subcategories: ["KEYS"],
    descriptionHint: "Keychain? How many keys? Any tags or fobs?",
  },
  WALLET: {
    id: "WALLET",
    label: "Wallet",
    icon: "👛",
    subcategories: ["WALLET_PURSE"],
    descriptionHint: "Material, brand, zip or fold? (Keep contents for the private field.)",
  },
  CLOTHING: {
    id: "CLOTHING",
    label: "Clothing",
    icon: "🧥",
    subcategories: ["JACKET_HOODIE", "SCARF_HAT", "OTHER_CLOTHING"],
    otherSub: "OTHER_CLOTHING",
    descriptionHint: "Size, brand, logo or print?",
  },
  BOTTLE: {
    id: "BOTTLE",
    label: "Bottle",
    icon: "🧴",
    subcategories: ["BOTTLE_FLASK"],
    descriptionHint: "Brand, stickers, dents, lid type?",
  },
  BOOKS: {
    id: "BOOKS",
    label: "Books",
    icon: "📚",
    subcategories: ["BOOK_NOTEBOOK"],
    descriptionHint: "Title or subject? Cover colour, notes inside?",
  },
  OTHER: {
    id: "OTHER",
    label: "Other",
    icon: "📦",
    subcategories: ["OTHER"],
    descriptionHint: "What is it? Size, material, anything unusual?",
  },
};

export const SUBCATEGORY_LABELS: Record<Subcategory, string> = {
  PHONE: "Phone",
  EARBUDS_HEADPHONES: "Earbuds/Headphones",
  LAPTOP_TABLET: "Laptop/Tablet",
  CHARGER_CABLE: "Charger/Cable",
  OTHER_ELECTRONICS: "Other electronics",
  BACKPACK: "Backpack",
  HANDBAG: "Handbag",
  LAPTOP_BAG: "Laptop bag",
  OTHER_BAG: "Other bag",
  STUDENT_ID: "Student ID",
  NATIONAL_ID: "National ID",
  OTHER_DOCUMENT: "Other card/document",
  KEYS: "Keys",
  WALLET_PURSE: "Wallet/Purse",
  JACKET_HOODIE: "Jacket/Hoodie",
  SCARF_HAT: "Scarf/Hat",
  OTHER_CLOTHING: "Other clothing",
  BOTTLE_FLASK: "Bottle/Flask",
  BOOK_NOTEBOOK: "Book/Notebook",
  OTHER: "Other",
};

const PARENT_OF: Record<Subcategory, Category> = Object.fromEntries(
  Object.values(CATEGORY_INFO).flatMap((c) => c.subcategories.map((s) => [s, c.id])),
) as Record<Subcategory, Category>;

export function parentOf(sub: Subcategory): Category {
  return PARENT_OF[sub];
}

/** True for the catch-all subcategories ("Other bag", "Other", ...). */
export function isCatchAll(sub: Subcategory): boolean {
  return sub === "OTHER" || CATEGORY_INFO[parentOf(sub)].otherSub === sub;
}

export type CategoryCompatibility = "SAME" | "VIA_OTHER" | "INCOMPATIBLE";

export function categoryCompatibility(a: Subcategory, b: Subcategory): CategoryCompatibility {
  if (a === b) return "SAME";
  if (a === "OTHER" || b === "OTHER") return "VIA_OTHER";
  if (parentOf(a) === parentOf(b) && (isCatchAll(a) || isCatchAll(b))) return "VIA_OTHER";
  return "INCOMPATIBLE";
}
