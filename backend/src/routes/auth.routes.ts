import { Router } from "express";
import * as controller from "../controllers/auth.controller";

/** Staff sign-in. Students never need an account to report something. */
export const authRoutes = Router();

authRoutes.get("/me", controller.me);
authRoutes.post("/staff/login", controller.login);
authRoutes.post("/logout", controller.logout);
