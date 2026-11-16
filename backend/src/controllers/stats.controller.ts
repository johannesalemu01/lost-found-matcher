import type { Request, Response } from "express";
import { getStats } from "../services/stats.service";

export async function get(_req: Request, res: Response) {
  res.json(await getStats());
}
