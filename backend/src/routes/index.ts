import { Router } from "express";
import { assistRoutes } from "./assist.routes";
import { authRoutes } from "./auth.routes";
import { matchesRoutes } from "./matches.routes";
import { reportsRoutes } from "./reports.routes";
import { statsRoutes } from "./stats.routes";

/** Every module mounts its own router here – the one place to see the whole API. */
export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
  res.json({ ok: true });
});
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/reports", reportsRoutes);
apiRoutes.use("/matches", matchesRoutes);
apiRoutes.use("/assist", assistRoutes);
apiRoutes.use("/stats", statsRoutes);
