import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireStaff } from "../middlewares/require-staff";
import * as controller from "../controllers/reports.controller";

export const reportsRoutes = Router();

reportsRoutes.post("/", asyncHandler(controller.create));
reportsRoutes.get("/", asyncHandler(controller.list));
reportsRoutes.get("/mine", asyncHandler(controller.mine));
reportsRoutes.post("/:id/close", requireStaff, asyncHandler(controller.close));
