import { z } from "zod";
import { COLOR_FAMILIES, REPORT_TYPES, SUBCATEGORIES } from "@lf/shared";

// ───── Requests ─────

export const assistRequestSchema = z.object({
  type: z.enum(REPORT_TYPES).default("LOST"),
  text: z.string().trim().max(1100).default(""),
  subcategory: z.enum(SUBCATEGORIES).optional().nullable(),
  colorFamily: z.enum(COLOR_FAMILIES).optional().nullable(),
  brand: z.string().trim().max(50).optional().nullable(),
  /** Omitted while the form has not reached the location step. */
  locations: z.array(z.string()).max(20).optional(),
});

// ───── What the model must return (anything else → rule-based fallback) ─────

export const aiExtractionSchema = z.object({
  subcategory: z.enum(SUBCATEGORIES).nullable(),
  colorFamily: z.enum(COLOR_FAMILIES).nullable(),
  brand: z.string().trim().max(50).nullable(),
  features: z.array(z.string().trim().min(1).max(40)).max(6),
});

export const aiClaritySchema = z.object({
  questions: z.array(z.string().trim().min(5).max(160)).max(3),
});
