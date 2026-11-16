/** localStorage keys – per-device conveniences only, never relied on for correctness. */
export const STORAGE_KEYS = {
  contact: "lf-contact",
} as const;

export const REPORT_FORM_STEPS = ["What is it?", "Where & when?", "Contact"] as const;

/** Server clock skew we tolerate when checking "not in the future". */
export const FUTURE_TOLERANCE_MS = 5 * 60_000;

export const DEMO_CONTACTS = ["amina@example.edu", "+251911000111"] as const;
