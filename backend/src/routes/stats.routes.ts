import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as controller from "../controllers/stats.controller";

export const statsRoutes = Router();

statsRoutes.get("/", asyncHandler(controller.get));
