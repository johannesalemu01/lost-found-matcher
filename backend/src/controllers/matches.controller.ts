import type { Request, Response } from "express";
import { validate } from "../utils/validate";
import { matchesQuerySchema, pairSchema, returnedSchema } from "../validators/match.validator";
import type { StaffMatchesResponse } from "../interfaces";
import * as service from "../services/matches.service";

/** Suggestions grouped by lost report (incl. both private details) + confirmed pairs awaiting handover. */
export async function list(req: Request, res: Response) {
  const { band } = validate(matchesQuerySchema, req.query);
  const [groups, awaitingHandover] = await Promise.all([service.suggestedMatches(band), service.awaitingHandover()]);
  const body: StaffMatchesResponse = { groups, awaitingHandover };
  res.json(body);
}

export async function confirm(req: Request, res: Response) {
  const { lostId, foundId, note } = validate(pairSchema, req.body);
  await service.confirmMatch(lostId, foundId, note);
  res.json({ ok: true });
}

export async function reject(req: Request, res: Response) {
  const { lostId, foundId, note } = validate(pairSchema, req.body);
  await service.rejectMatch(lostId, foundId, note);
  res.json({ ok: true });
}

export async function undo(req: Request, res: Response) {
  const { lostId, foundId } = validate(pairSchema, req.body);
  await service.undoDecision(lostId, foundId);
  res.json({ ok: true });
}

export async function returned(req: Request, res: Response) {
  const { lostId, foundId, note } = validate(returnedSchema, req.body);
  await service.markReturned(lostId, foundId, note);
  res.json({ ok: true });
}
