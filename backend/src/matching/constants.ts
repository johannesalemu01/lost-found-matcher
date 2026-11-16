/**
 * Every number the matching engine uses lives here, so the scoring can be
 * reviewed (and later tuned from staff feedback) in one place.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const WEIGHTS = {
  category: { max: 25, same: 25, viaOther: 10 },
  text: { max: 30, brandBonus: 8 },
  colour: { max: 15, same: 15, unknown: 7 },
  location: { max: 15, shared: 15, neighbour: 9, unknown: 7 },
  time: { max: 15 },
} as const;

export const TIME_RULES = {
  /** People misremember: a find up to 1h before the window still counts as "in the window". */
  beforeWindowTolerance: 1 * HOUR,
  /** Found up to 6h after the window ends = full time points (it takes a while to hand items in). */
  fullPointsAfterWindow: 6 * HOUR,
  /** Time points decay linearly to 0 at this distance after the window end. */
  zeroPointsAfterWindow: 14 * DAY,
  /** Found later than this after the window = hard "no match". */
  maxAfterWindow: 30 * DAY,
  /** Found later than this AND far away = implausible, band capped at WEAK. */
  lateAndFarAfter: 7 * DAY,
} as const;

export const BANDS = {
  STRONG: 70,
  POSSIBLE: 45,
  WEAK: 30,
} as const;

/** Highest score allowed when a band is capped (keeps score bar and band badge consistent). */
export const CAP_MAX_SCORE = {
  POSSIBLE: BANDS.STRONG - 1, // 69
  WEAK: BANDS.POSSIBLE - 1, // 44
} as const;

export const MS = { HOUR, DAY } as const;
