import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireStaff } from "../middlewares/require-staff";
import { optionalPhotoUpload } from "../middlewares/upload";
import * as controller from "../controllers/reports.controller";

export const reportsRoutes = Router();

reportsRoutes.post("/", optionalPhotoUpload, asyncHandler(controller.create));
reportsRoutes.get("/", asyncHandler(controller.list));
reportsRoutes.get("/mine", asyncHandler(controller.mine));
reportsRoutes.get("/:id/photo", requireStaff, asyncHandler(controller.photo));
reportsRoutes.post("/:id/close", requireStaff, asyncHandler(controller.close));
