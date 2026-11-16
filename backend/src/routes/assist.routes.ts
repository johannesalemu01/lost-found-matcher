import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as controller from "../controllers/assist.controller";

/** Optional helpers for the report form. They only suggest; the person confirms every field. */
export const assistRoutes = Router();

assistRoutes.get("/status", controller.status);
assistRoutes.post("/extract", asyncHandler(controller.extract));
assistRoutes.post("/clarity", asyncHandler(controller.clarity));
