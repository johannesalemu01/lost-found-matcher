/**
 * `npm run db:seed` – wipes the tables and loads the demo data from reports.data.ts.
 */
import "../../src/config/load-env"; // must stay first
import { readFile, readdir, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { parentOf } from "@lf/shared";
import { uploadDir } from "../../src/config/env";
import { savePhoto } from "../../src/services/photo.service";
import { ago, seedConfirmedPairs, seedReports } from "./reports.data";

const PHOTOS_DIR = join(dirname(fileURLToPath(import.meta.url)), "photos");

/** Remove photos uploaded earlier – only our own <uuid>.<ext> files. */
async function clearUploads() {
  const files = await readdir(uploadDir()).catch(() => [] as string[]);
  const ours = files.filter((f) => /^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(f));
  await Promise.all(ours.map((f) => unlink(join(uploadDir(), f))));
}

const prisma = new PrismaClient();

async function main() {
  await prisma.matchDecision.deleteMany();
  await prisma.report.deleteMany();
  await clearUploads();

  const ids: Record<string, string> = {};
  for (const { key, subcategory, eventEnd, createdAt, photo, ...r } of seedReports) {
    const photoFile = photo ? await savePhoto(await readFile(join(PHOTOS_DIR, photo))) : null;
    const eventStart = r.eventStart as Date;
    const created = await prisma.report.create({
      data: {
        ...r,
        subcategory,
        photoFile,
        category: parentOf(subcategory),
        eventEnd: eventEnd ?? eventStart,
        // Reports are usually filed shortly after the event.
        createdAt: createdAt ?? new Date((eventEnd ?? eventStart).getTime() + 30 * 60 * 1000),
      },
    });
    ids[key] = created.id;
  }

  for (const pair of seedConfirmedPairs) {
    await prisma.matchDecision.create({
      data: {
        lostId: ids[pair.lostKey],
        foundId: ids[pair.foundKey],
        decision: "CONFIRMED",
        note: pair.note,
        createdAt: ago(pair.confirmedAgo),
      },
    });
  }

  console.log(`Seeded ${seedReports.length} reports and ${seedConfirmedPairs.length} confirmed match(es).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
