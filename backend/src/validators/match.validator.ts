import { z } from "zod";

const note = z
  .string()
  .trim()
  .max(500, "Keep it under 500 characters")
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

export const pairSchema = z.object({
  lostId: z.uuid("Invalid lost report id"),
  foundId: z.uuid("Invalid found report id"),
  note,
});

export const returnedSchema = pairSchema.extend({
  verified: z.literal(true, { error: "Tick “Owner answered the verification question correctly” first" }),
});

export const matchesQuerySchema = z.object({
  band: z.enum(["STRONG", "POSSIBLE", "WEAK"]).optional(),
});
