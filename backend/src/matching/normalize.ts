import { COLOR_WORDS, type ColorFamily } from "@lf/shared";
import { BRANDS, CONCEPTS, PHRASES, STOP_WORDS } from "./concepts";

export interface ColourMention {
  word: string;
  family: Exclude<ColorFamily, "UNKNOWN">;
}

export interface NormalizedText {
  /** De-duplicated concept tokens, in order of first appearance. */
  tokens: string[];
  /** Colour words found in the text (kept out of `tokens`; colour is scored separately). */
  colours: ColourMention[];
  /** Brands recognised in the text, canonical spelling. */
  brands: string[];
}

/** Very small plural stemmer – good enough for item nouns ("keys", "earbuds", "glasses", "batteries"). */
export function stem(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (/(ches|shes|xes|sses)$/.test(word)) return word.slice(0, -2);
  if (/(ss|us|is)$/.test(word)) return word;
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

const COLOUR_MODIFIERS = new Set(["dark", "light", "pale", "bright", "deep"]);

/**
 * Turns free text into comparable concept tokens:
 * lower-case → strip punctuation → stem plurals → two-word phrases → colour words →
 * stop words → concept dictionary.
 *
 *   normalize("Black AirPods case near the cafeteria")
 *   // → { tokens: ["audio", "case"], colours: [{ word: "black", family: "BLACK_DARK" }], brands: ["Apple"] }
 */
export function normalize(text: string): NormalizedText {
  const raw = text
    .toLowerCase()
    .replace(/['’]s\b/g, "") // "owner's" -> "owner"
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const words = raw.map(stem);

  const tokens: string[] = [];
  const colours: ColourMention[] = [];
  const brands: string[] = [];
  const addUnique = <T>(list: T[], value: T) => {
    if (!list.includes(value)) list.push(value);
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const brand = BRANDS[raw[i]] ?? BRANDS[word];
    if (brand) addUnique(brands, brand);

    const next = words[i + 1];
    // Longest phrase first: "student id card" (3 words), then "student id" (2 words).
    let phraseLength = 0;
    let phrase: string | undefined;
    for (const n of [3, 2]) {
      if (i + n > words.length) continue;
      phrase = PHRASES[words.slice(i, i + n).join(" ")];
      if (phrase) {
        phraseLength = n;
        break;
      }
    }
    if (phrase) {
      const phraseBrand = BRANDS[phrase];
      if (phraseBrand) addUnique(brands, phraseBrand);
      addUnique(tokens, phrase);
      i += phraseLength - 1;
      continue;
    }

    const family = COLOR_WORDS[word];
    if (family) {
      // "dark blue" is blue, not black: a modifier followed by a colour is not a colour itself.
      const modifiesNext = COLOUR_MODIFIERS.has(word) && next !== undefined && COLOR_WORDS[next] !== undefined;
      if (!modifiesNext && !colours.some((c) => c.word === word)) colours.push({ word, family });
      continue;
    }

    if (STOP_WORDS.has(raw[i]) || STOP_WORDS.has(word)) continue;

    const concept = CONCEPTS[word];
    if (concept) addUnique(tokens, concept);
    else if (word.length >= 3 && !/^\d+$/.test(word)) addUnique(tokens, word);
  }

  return { tokens, colours, brands };
}
