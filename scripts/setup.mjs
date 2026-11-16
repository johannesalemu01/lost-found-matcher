#!/usr/bin/env node
// One-command setup for a fresh clone:
//   1. copy .env.example -> .env (only if .env is missing)
//   2. npm install (all workspaces)
//   3. start PostgreSQL with docker compose and wait for the healthcheck
//   4. apply Prisma migrations and seed demo data
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function step(title, cmd) {
  console.log(`\n▶ ${title}\n  $ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

for (const pkg of ["backend", "frontend"]) {
  const example = join(root, pkg, ".env.example");
  const target = join(root, pkg, ".env");
  if (!existsSync(target) && existsSync(example)) {
    copyFileSync(example, target);
    console.log(`✓ created ${pkg}/.env from .env.example`);
  }
}

try {
  step("Installing dependencies", "npm install");
  step("Starting PostgreSQL (docker compose)", "docker compose up -d --wait");
  step("Applying database migrations", "npm run db:migrate -w backend");
  step("Seeding demo data", "npm run db:seed -w backend");
  console.log("\n✅ Setup complete. Run `npm run dev` and open http://localhost:3000\n");
} catch {
  console.error(
    "\n❌ Setup failed. Check that Docker is running and port 5440 is free, then run `npm run setup` again.\n",
  );
  process.exit(1);
}
