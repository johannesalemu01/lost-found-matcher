/**
 * `npm run db:seed` – wipes the tables and loads the demo data from reports.data.ts.
 */
import { PrismaClient } from "@prisma/client";
import { parentOf } from "@lf/shared";
import { ago, seedConfirmedPairs, seedReports } from "./reports.data";

const prisma = new PrismaClient();

async function main() {
  await prisma.matchDecision.deleteMany();
  await prisma.report.deleteMany();

  const ids: Record<string, string> = {};
  for (const { key, subcategory, eventEnd, createdAt, ...r } of seedReports) {
    const eventStart = r.eventStart as Date;
    const created = await prisma.report.create({
      data: {
        ...r,
        subcategory,
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
