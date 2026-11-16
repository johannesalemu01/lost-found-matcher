import {
  SUBCATEGORY_LABELS,
  NOT_SURE,
  areNeighbours,
  categoryCompatibility,
  locationLabel,
  type ColorFamily,
  type ScoreComponent,
} from "@lf/shared";
import { MS, TIME_RULES, WEIGHTS } from "./constants";
import { normalize, type NormalizedText } from "./normalize";
import type { MatchableReport } from "./types";

// ───────────────────────────── Category (25) ─────────────────────────────

export function scoreCategory(lost: MatchableReport, found: MatchableReport): ScoreComponent {
  const w = WEIGHTS.category;
  const compat = categoryCompatibility(lost.subcategory, found.subcategory);
  if (compat === "SAME") {
    return {
      key: "category",
      points: w.same,
      max: w.max,
      kind: "support",
      reason: `Same item type: ${SUBCATEGORY_LABELS[lost.subcategory]}`,
    };
  }
  // INCOMPATIBLE never reaches scoring – it is a hard rule (see engine.ts).
  return {
    key: "category",
    points: w.viaOther,
    max: w.max,
    kind: "neutral",
    reason: `Related item type: ${SUBCATEGORY_LABELS[lost.subcategory]} ~ ${SUBCATEGORY_LABELS[found.subcategory]}`,
  };
}

// ───────────────────────────── Text (30) ─────────────────────────────

export function textOf(r: MatchableReport): NormalizedText {
  return normalize(`${r.title} ${r.description}`);
}

function sameBrand(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Dice similarity of concept tokens: 2·|shared| / (|A| + |B|), scaled to 30.
 * Dice (rather than "any word in common") means a long, specific description is not
 * rewarded for matching one generic word, and a short one is not punished for being short.
 * An exact brand match adds a bonus; a different brand is reported separately as a conflict.
 */
export function scoreText(
  lost: MatchableReport,
  found: MatchableReport,
): { component: ScoreComponent; brandConflict: ScoreComponent | null } {
  const w = WEIGHTS.text;
  const a = textOf(lost).tokens;
  const b = textOf(found).tokens;
  const shared = a.filter((t) => b.includes(t));
  const dice = a.length + b.length === 0 ? 0 : (2 * shared.length) / (a.length + b.length);
  let points = dice * w.max;

  const brandsMatch = lost.brand && found.brand && sameBrand(lost.brand, found.brand);
  if (brandsMatch) points += w.brandBonus;
  points = Math.min(w.max, Math.round(points));

  const parts: string[] = [];
  if (shared.length > 0) parts.push(`Similar words: ${shared.join(", ")}`);
  if (brandsMatch) parts.push(`same brand (${found.brand!.trim()})`);

  const component: ScoreComponent =
    parts.length > 0
      ? { key: "text", points, max: w.max, kind: "support", reason: parts.join("; ") }
      : {
          key: "text",
          points,
          max: w.max,
          kind: "neutral",
          reason: a.length === 0 || b.length === 0 ? "Too little description to compare words" : "No words in common",
        };

  const brandConflict: ScoreComponent | null =
    lost.brand && found.brand && !brandsMatch
      ? {
          key: "brand",
          points: 0,
          max: 0,
          kind: "conflict",
          reason: `⚠ Brand conflict: ${lost.brand.trim()} vs ${found.brand.trim()}`,
        }
      : null;

  return { component, brandConflict };
}

// ───────────────────────────── Colour (15) ─────────────────────────────

const FAMILY_WORD: Record<ColorFamily, string> = {
  BLACK_DARK: "black",
  WHITE_LIGHT: "white",
  GREY_SILVER: "grey",
  BLUE: "blue",
  RED_PINK: "red",
  GREEN: "green",
  YELLOW_ORANGE: "yellow",
  BROWN_BEIGE: "brown",
  MULTI: "multicoloured",
  UNKNOWN: "unknown",
};

/** The colour family to compare, and the word the person actually used for it (for the explanation). */
export function effectiveColour(r: MatchableReport): { family: ColorFamily; word: string } {
  const mentions = textOf(r).colours;
  if (r.colorFamily !== "UNKNOWN") {
    const own = mentions.find((m) => m.family === r.colorFamily);
    return { family: r.colorFamily, word: own?.word ?? FAMILY_WORD[r.colorFamily] };
  }
  // Swatch left on "Not sure" but the text names a colour: use the first one mentioned.
  if (mentions.length > 0) return { family: mentions[0].family, word: mentions[0].word };
  return { family: "UNKNOWN", word: "unknown" };
}

export function scoreColour(lost: MatchableReport, found: MatchableReport): ScoreComponent {
  const w = WEIGHTS.colour;
  const a = effectiveColour(lost);
  const b = effectiveColour(found);
  const base = { key: "colour" as const, max: w.max };

  if (a.family === "UNKNOWN" || b.family === "UNKNOWN") {
    return { ...base, points: w.unknown, kind: "neutral", reason: "Colour not given on one side" };
  }
  if (a.family === b.family) {
    const reason = a.word === b.word ? `Colour: both ${a.word}` : `Colour: ${a.word} ≈ ${b.word}`;
    return { ...base, points: w.same, kind: "support", reason };
  }
  if (a.family === "MULTI" || b.family === "MULTI") {
    return { ...base, points: w.unknown, kind: "neutral", reason: `Colour: ${a.word} vs ${b.word} – may overlap` };
  }
  return { ...base, points: 0, kind: "conflict", reason: `⚠ Colour conflict: ${a.word} vs ${b.word}` };
}

// ───────────────────────────── Location (15) ─────────────────────────────

export function isLocationUnknown(locations: string[]): boolean {
  return locations.length === 0 || locations.includes(NOT_SURE);
}

export function scoreLocation(lost: MatchableReport, found: MatchableReport): ScoreComponent {
  const w = WEIGHTS.location;
  const base = { key: "location" as const, max: w.max };

  if (isLocationUnknown(lost.locations) || isLocationUnknown(found.locations)) {
    return { ...base, points: w.unknown, kind: "neutral", reason: "Location unknown" };
  }
  const shared = lost.locations.find((l) => found.locations.includes(l));
  if (shared) {
    return { ...base, points: w.shared, kind: "support", reason: `Location: both mention ${locationLabel(shared)}` };
  }
  for (const l of lost.locations) {
    for (const f of found.locations) {
      if (areNeighbours(l, f)) {
        return {
          ...base,
          points: w.neighbour,
          kind: "support",
          reason: `Location: ${locationLabel(l)} is next to ${locationLabel(f)}`,
        };
      }
    }
  }
  const lostLabel = lost.locations.map(locationLabel).join(" / ");
  const foundLabel = found.locations.map(locationLabel).join(" / ");
  return { ...base, points: 0, kind: "neutral", reason: `Location: ${lostLabel} vs ${foundLabel} (not nearby)` };
}

// ───────────────────────────── Time (15) ─────────────────────────────

export function humanDuration(ms: number): string {
  const hours = Math.round(ms / MS.HOUR);
  if (hours < 1) return "less than an hour";
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(ms / MS.DAY);
  return `${days} days`;
}

/**
 * Full points if found inside the lost window (with 1h tolerance before) or up to 6h after it;
 * then linear decay to 0 at 14 days after the window. Hard limits live in engine.ts.
 */
export function scoreTime(lost: MatchableReport, found: MatchableReport): ScoreComponent {
  const w = WEIGHTS.time;
  const t = found.eventStart.getTime();
  const start = lost.eventStart.getTime();
  const end = lost.eventEnd.getTime();
  const base = { key: "time" as const, max: w.max };

  if (t < start) {
    return { ...base, points: w.max, kind: "support", reason: "Found just before the lost window (within 1 h tolerance)" };
  }
  if (t <= end) {
    return { ...base, points: w.max, kind: "support", reason: "Found during the lost window" };
  }
  const after = t - end;
  const label = `Found ${humanDuration(after)} after the lost window`;
  if (after <= TIME_RULES.fullPointsAfterWindow) {
    return { ...base, points: w.max, kind: "support", reason: label };
  }
  const span = TIME_RULES.zeroPointsAfterWindow - TIME_RULES.fullPointsAfterWindow;
  const fraction = Math.max(0, 1 - (after - TIME_RULES.fullPointsAfterWindow) / span);
  const points = Math.round(w.max * fraction);
  return { ...base, points, kind: points >= w.max / 2 ? "support" : "neutral", reason: label };
}
