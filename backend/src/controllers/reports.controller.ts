import type { Request, Response } from "express";
import { isStaff } from "../middlewares/require-staff";
import { validate } from "../utils/validate";
import {
  createReportSchema,
  listReportsQuerySchema,
  myReportsQuerySchema,
  reportIdParamsSchema,
} from "../validators/report.validator";
import * as service from "../services/reports.service";

export async function create(req: Request, res: Response) {
  const input = validate(createReportSchema, req.body);
  res.status(201).json(await service.createReport(input));
}

export async function list(req: Request, res: Response) {
  const query = validate(listReportsQuerySchema, req.query);
  res.json({ reports: await service.listReports(query, isStaff(req)) });
}

export async function mine(req: Request, res: Response) {
  const { contact } = validate(myReportsQuerySchema, req.query);
  res.json({ reports: await service.myReports(contact) });
}

export async function close(req: Request, res: Response) {
  const { id } = validate(reportIdParamsSchema, req.params);
  res.json({ report: await service.closeReport(id) });
}
