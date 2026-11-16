import { z } from "zod";

/**
 * All environment configuration in one place.
 * Server settings are validated once at startup; AI settings are read lazily so the
 * app (and the tests) work with no key at all.
 */

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required – copy backend/.env.example to backend/.env"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema> & { corsOrigins: string[] };

export function loadServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment:\n${problems}`);
  }
  return { ...parsed.data, corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim()) };
}

export interface AiConfig {
  apiKey: string;
  model: string;
}

/** Null when the optional AI assist is not configured. The model name is never hard-coded. */
export function aiConfig(): AiConfig | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_EXTRACTION_MODEL?.trim().replace(/^models\//, "");
  return apiKey && model ? { apiKey, model } : null;
}
