import type { ZodType } from "zod";
import { aiConfig } from "../../config/env";

const TIMEOUT_MS = 5000;
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export function aiEnabled(): boolean {
  return aiConfig() !== null;
}

/**
 * Ask Gemini for strict JSON and validate it. Returns null – never throws – on a missing key,
 * network error, timeout, non-200, or output that does not pass the schema; the caller then
 * falls back to rules. Callers send public text, or a photo the person explicitly asked us to
 * read – never private details or contacts.
 */
export interface InlineImage {
  mimeType: string;
  data: Buffer;
}

export async function generateJson<T>(
  prompt: string,
  schema: ZodType<T>,
  task: string,
  image?: InlineImage,
): Promise<T | null> {
  const config = aiConfig();
  if (!config) return null;
  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(config.model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": config.apiKey },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              ...(image ? [{ inline_data: { mime_type: image.mimeType, data: image.data.toString("base64") } }] : []),
              { text: prompt },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[ai] ${task}: HTTP ${res.status} – using rule-based fallback`);
      return null;
    }
    const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    const parsed = schema.safeParse(JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")));
    if (!parsed.success) {
      console.warn(`[ai] ${task}: response did not match the schema – using rule-based fallback`);
      return null;
    }
    return parsed.data;
  } catch (err) {
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.warn(`[ai] ${task}: ${reason} – using rule-based fallback`);
    return null;
  }
}
