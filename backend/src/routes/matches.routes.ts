import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireStaff } from "../middlewares/require-staff";
import * as controller from "../controllers/matches.controller";

/** Staff only: review suggestions and record decisions. */
export const matchesRoutes = Router();
matchesRoutes.use(requireStaff);

matchesRoutes.get("/", asyncHandler(controller.list));
matchesRoutes.post("/confirm", asyncHandler(controller.confirm));
matchesRoutes.post("/reject", asyncHandler(controller.reject));
matchesRoutes.post("/undo", asyncHandler(controller.undo));
matchesRoutes.post("/returned", asyncHandler(controller.returned));
