// The whole suite must pass with no AI key and no network access.
delete process.env.GEMINI_API_KEY;

globalThis.fetch = (async () => {
  throw new Error("Network access is disabled in tests");
}) as typeof fetch;
