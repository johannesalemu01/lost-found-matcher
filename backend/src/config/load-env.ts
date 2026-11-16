import { existsSync } from "node:fs";

/**
 * Load backend/.env when it exists (local development). On hosts like Render there is
 * no .env file – variables come from the dashboard – so this simply does nothing.
 * Import this first so the variables are set before anything reads them.
 */
if (existsSync(".env")) process.loadEnvFile(".env");
