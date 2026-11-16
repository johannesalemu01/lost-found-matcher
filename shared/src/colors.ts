/**
 * Colours are compared as *families*, not exact names, because people see and
 * name colours differently ("black" vs "dark", "navy" vs "blue").
 */

export const COLOR_FAMILIES = [
  "BLACK_DARK",
  "WHITE_LIGHT",
  "GREY_SILVER",
  "BLUE",
  "RED_PINK",
  "GREEN",
  "YELLOW_ORANGE",
  "BROWN_BEIGE",
  "MULTI",
  "UNKNOWN",
] as const;
export type ColorFamily = (typeof COLOR_FAMILIES)[number];

export const COLOR_INFO: Record<ColorFamily, { label: string; swatch: string }> = {
  BLACK_DARK: { label: "Black / dark", swatch: "#1f2328" },
  WHITE_LIGHT: { label: "White / light", swatch: "#f6f7f8" },
  GREY_SILVER: { label: "Grey / silver", swatch: "#9aa1a9" },
  BLUE: { label: "Blue / navy", swatch: "#2f6fd6" },
  RED_PINK: { label: "Red / pink", swatch: "#d64545" },
  GREEN: { label: "Green", swatch: "#3a9a5b" },
  YELLOW_ORANGE: { label: "Yellow / orange", swatch: "#f0a92e" },
  BROWN_BEIGE: { label: "Brown / beige", swatch: "#9b6b43" },
  MULTI: { label: "Multicoloured", swatch: "conic-gradient(#d64545,#f0a92e,#3a9a5b,#2f6fd6,#d64545)" },
  UNKNOWN: { label: "Not sure", swatch: "transparent" },
};

/** Free-text colour words -> family. Used to read colours out of descriptions. */
export const COLOR_WORDS: Record<string, Exclude<ColorFamily, "UNKNOWN">> = {
  black: "BLACK_DARK",
  dark: "BLACK_DARK",
  charcoal: "BLACK_DARK",
  jet: "BLACK_DARK",
  white: "WHITE_LIGHT",
  cream: "WHITE_LIGHT",
  ivory: "WHITE_LIGHT",
  offwhite: "WHITE_LIGHT",
  grey: "GREY_SILVER",
  gray: "GREY_SILVER",
  silver: "GREY_SILVER",
  metallic: "GREY_SILVER",
  blue: "BLUE",
  navy: "BLUE",
  teal: "BLUE",
  turquoise: "BLUE",
  cyan: "BLUE",
  red: "RED_PINK",
  pink: "RED_PINK",
  maroon: "RED_PINK",
  burgundy: "RED_PINK",
  purple: "RED_PINK",
  green: "GREEN",
  olive: "GREEN",
  khaki: "GREEN",
  yellow: "YELLOW_ORANGE",
  orange: "YELLOW_ORANGE",
  gold: "YELLOW_ORANGE",
  golden: "YELLOW_ORANGE",
  brown: "BROWN_BEIGE",
  beige: "BROWN_BEIGE",
  tan: "BROWN_BEIGE",
  multicolour: "MULTI",
  multicolor: "MULTI",
  multicoloured: "MULTI",
  multicolored: "MULTI",
  colourful: "MULTI",
  colorful: "MULTI",
  rainbow: "MULTI",
};
