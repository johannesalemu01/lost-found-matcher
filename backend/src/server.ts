import { createApp } from "./app";
import { aiConfig, loadServerEnv } from "./config/env";

const env = loadServerEnv();

createApp({ corsOrigins: env.corsOrigins }).listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
  const ai = aiConfig();
  console.log(
    ai
      ? `AI assist: on (${ai.model}) – used only to pre-fill fields and phrase questions`
      : "AI assist: off – using rule-based suggestions (set GEMINI_API_KEY to enable)",
  );
});
