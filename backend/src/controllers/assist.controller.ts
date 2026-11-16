import type { Request, Response } from "express";
import { validate } from "../utils/validate";
import { assistRequestSchema } from "../validators/assist.validator";
import { clarityCheck, suggestFields } from "../services/assist.service";
import { aiEnabled } from "../services/ai/gemini.client";

export function status(_req: Request, res: Response) {
  res.json({ ai: aiEnabled() });
}

export async function extract(req: Request, res: Response) {
  const { text } = validate(assistRequestSchema, req.body);
  res.json(await suggestFields(text));
}

export async function clarity(req: Request, res: Response) {
  const input = validate(assistRequestSchema, req.body);
  res.json(
    await clarityCheck({
      type: input.type,
      subcategory: input.subcategory,
      description: input.text,
      colorFamily: input.colorFamily,
      brand: input.brand,
      locations: input.locations,
    }),
  );
}
