import type { Request, Response } from "express";
import { validate } from "../utils/validate";
import { assistRequestSchema } from "../validators/assist.validator";
import { clarityCheck, suggestFields, suggestFieldsFromPhoto } from "../services/assist.service";
import { badRequest } from "../utils/errors";
import { aiEnabled } from "../services/ai/gemini.client";

export function status(_req: Request, res: Response) {
  res.json({ ai: aiEnabled() });
}

export async function extract(req: Request, res: Response) {
  const { text } = validate(assistRequestSchema, req.body);
  res.json(await suggestFields(text));
}

export async function extractPhoto(req: Request, res: Response) {
  if (!req.file) throw badRequest("Attach a photo.", { photo: "Attach a photo." });
  res.json(await suggestFieldsFromPhoto(req.file.buffer));
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
