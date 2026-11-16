import { afterEach, describe, expect, it, vi } from "vitest";
import { clarityCheck, suggestFields, suggestFieldsFromPhoto } from "../../src/services/assist.service";

const vague = {
  type: "LOST" as const,
  subcategory: "OTHER_BAG" as const,
  description: "lost my bag somewhere",
  colorFamily: "UNKNOWN" as const,
  locations: ["NOT_SURE"],
};

function geminiReplies(text: string) {
  return vi.fn(async () =>
    new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 }),
  );
}

describe("AI assist is optional", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_EXTRACTION_MODEL;
    vi.restoreAllMocks();
  });

  it("with no API key, uses the rules and never touches the network", async () => {
    const spy = vi.fn(realFetch);
    globalThis.fetch = spy as typeof fetch;
    const fields = await suggestFields("Black backpack containing a laptop charger");
    const clarity = await clarityCheck(vague);
    expect(fields).toMatchObject({ subcategory: "BACKPACK", colorFamily: "BLACK_DARK", source: "rules" });
    expect(clarity.source).toBe("rules");
    expect(clarity.questions.length).toBeGreaterThan(0);
    expect(spy).not.toHaveBeenCalled();
  });

  it("with a key but no network, falls back silently and logs a warning", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_EXTRACTION_MODEL = "test-model";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const clarity = await clarityCheck(vague); // test/setup.ts makes fetch throw
    expect(clarity).toMatchObject({ level: "vague", source: "rules" });
    expect(warn).toHaveBeenCalled();
  });

  it("falls back when the model returns invalid JSON or the wrong shape", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_EXTRACTION_MODEL = "test-model";
    vi.spyOn(console, "warn").mockImplementation(() => {});

    globalThis.fetch = geminiReplies("not json at all") as typeof fetch;
    expect((await suggestFields("black airpods case")).source).toBe("rules");

    globalThis.fetch = geminiReplies('{"subcategory":"SPACESHIP","colorFamily":null,"brand":null,"features":[]}') as typeof fetch;
    expect((await suggestFields("black airpods case")).source).toBe("rules");
  });

  it("uses valid AI output, but only as a suggestion", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_EXTRACTION_MODEL = "test-model";
    globalThis.fetch = geminiReplies(
      '{"subcategory":"EARBUDS_HEADPHONES","colorFamily":"BLACK_DARK","brand":"Apple","features":["cat sticker"]}',
    ) as typeof fetch;
    expect(await suggestFields("black airpods case with a cat sticker")).toEqual({
      subcategory: "EARBUDS_HEADPHONES",
      colorFamily: "BLACK_DARK",
      brand: "Apple",
      features: ["cat sticker"],
      source: "ai",
    });
  });

  it("the rules decide whether a report is vague; AI can only rephrase the questions", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_EXTRACTION_MODEL = "test-model";
    const fetchSpy = geminiReplies('{"questions":["Anything?"]}');
    globalThis.fetch = fetchSpy as typeof fetch;
    const clear = await clarityCheck({
      type: "FOUND",
      subcategory: "EARBUDS_HEADPHONES",
      description: "Black JBL headphones with a scratch on the left ear cup",
      locations: ["GYM"],
    });
    expect(clear).toEqual({ level: "good", questions: [], source: "rules" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

  it("photo suggestions need the AI: without a key they come back empty, with no network call", async () => {
    const spy = vi.fn(realFetch);
    globalThis.fetch = spy as typeof fetch;
    expect(await suggestFieldsFromPhoto(pngBytes)).toEqual({
      subcategory: null,
      colorFamily: null,
      brand: null,
      features: [],
      source: "rules",
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it("rejects a file that is not really an image before calling the AI", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_EXTRACTION_MODEL = "test-model";
    const fetchSpy = geminiReplies("{}");
    globalThis.fetch = fetchSpy as typeof fetch;
    await expect(suggestFieldsFromPhoto(Buffer.from("not an image"))).rejects.toMatchObject({ status: 400 });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends the photo inline and validates the AI's answer", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_EXTRACTION_MODEL = "test-model";
    const fetchSpy = geminiReplies('{"subcategory":"EARBUDS_HEADPHONES","colorFamily":"BLACK_DARK","brand":null,"features":["cat sticker"]}');
    globalThis.fetch = fetchSpy as typeof fetch;
    const result = await suggestFieldsFromPhoto(pngBytes);
    expect(result).toMatchObject({ subcategory: "EARBUDS_HEADPHONES", source: "ai" });
    const body = JSON.parse((fetchSpy.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.contents[0].parts[0].inline_data).toMatchObject({ mime_type: "image/png" });
  });
});
