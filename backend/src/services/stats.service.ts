import type { StatsResponse } from "../interfaces";
import { suggestedMatches } from "./matches.service";
import { countActiveReports } from "../models/report.model";

/** Numbers for the home page. */
export async function getStats(now = new Date()): Promise<StatsResponse> {
  const [openLost, openFound, strongGroups] = await Promise.all([
    countActiveReports("LOST", now),
    countActiveReports("FOUND", now),
    suggestedMatches("STRONG", now),
  ]);
  const strongMatches = strongGroups.reduce((sum, g) => sum + g.matches.length, 0);
  return { openLost, openFound, strongMatches };
}
