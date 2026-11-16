import { z } from "zod";
import {
  CATEGORIES,
  COLOR_FAMILIES,
  LOCATION_IDS,
  NOT_SURE,
  REPORT_STATUSES,
  REPORT_TYPES,
  SUBCATEGORIES,
} from "@lf/shared";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s\-().]{7,20}$/;
/** Clock skew between the browser and the server. */
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

/** Contacts are stored normalised so "/my-reports" lookups match however they are typed. */
export function normalizeContact(value: string): string {
  const v = value.trim();
  if (EMAIL.test(v)) return v.toLowerCase();
  return v.replace(/[\s\-().]/g, "");
}

export const contactSchema = z
  .string({ error: "Enter an email address or phone number" })
  .trim()
  .min(1, "Enter an email address or phone number")
  .max(120, "Too long")
  .refine((v) => EMAIL.test(v) || (PHONE.test(v) && v.replace(/\D/g, "").length >= 7), {
    message: "Enter a valid email address or phone number",
  })
  .transform(normalizeContact);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const date = (label: string) =>
  z.coerce
    .date({ error: `${label} is not a valid date` })
    .refine((d) => !Number.isNaN(d.getTime()), `${label} is not a valid date`);

export const createReportSchema = z
  .object({
    type: z.enum(REPORT_TYPES, { error: "Choose lost or found" }),
    subcategory: z.enum(SUBCATEGORIES, { error: "Choose what kind of item it is" }),
    title: z
      .string({ error: "Give it a short title" })
      .trim()
      .min(3, "At least 3 characters")
      .max(80, "Keep it under 80 characters"),
    description: z.string().trim().max(1000, "Keep it under 1000 characters").default(""),
    colorFamily: z.enum(COLOR_FAMILIES).default("UNKNOWN"),
    brand: optionalText(50),
    locations: z
      .array(z.enum(LOCATION_IDS as [string, ...string[]], { error: "Unknown location" }), {
        error: "Pick at least one place (or “Not sure”)",
      })
      .min(1, "Pick at least one place (or “Not sure”)")
      .max(LOCATION_IDS.length)
      // "Not sure" wins over specific places; duplicates removed.
      .transform((locs) => (locs.includes(NOT_SURE) ? [NOT_SURE] : [...new Set(locs)])),
    eventStart: date("Start time"),
    eventEnd: date("End time").optional(),
    privateDetail: optionalText(300),
    contactName: z.string({ error: "Tell us your name" }).trim().min(2, "Tell us your name").max(80, "Too long"),
    contactEmailOrPhone: contactSchema,
  })
  .transform((r) => ({
    ...r,
    // FOUND: one moment (start = end). LOST: a window.
    eventEnd: r.type === "FOUND" || !r.eventEnd ? r.eventStart : r.eventEnd,
  }))
  .superRefine((r, ctx) => {
    const latest = Date.now() + FUTURE_TOLERANCE_MS;
    if (r.eventStart.getTime() > latest) {
      ctx.addIssue({ code: "custom", path: ["eventStart"], message: "This can’t be in the future" });
    }
    if (r.eventEnd.getTime() > latest) {
      ctx.addIssue({ code: "custom", path: ["eventEnd"], message: "This can’t be in the future" });
    }
    if (r.eventEnd < r.eventStart) {
      ctx.addIssue({ code: "custom", path: ["eventEnd"], message: "The end must be after the start" });
    }
  });

export const listReportsQuerySchema = z.object({
  type: z.enum(REPORT_TYPES).optional(),
  status: z.enum([...REPORT_STATUSES, "EXPIRED"] as const).optional(),
  category: z.enum(CATEGORIES).optional(),
  q: z.string().trim().max(100).optional(),
});

export const myReportsQuerySchema = z.object({ contact: contactSchema });

export const reportIdParamsSchema = z.object({ id: z.uuid("Report not found.") });
