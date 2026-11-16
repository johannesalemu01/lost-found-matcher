import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { apiRoutes } from "./routes";

export function createApp({ corsOrigins }: { corsOrigins: string[] }) {
  const app = express();
  // credentials: the staff session is an httpOnly cookie, so the web app must be allowed to send it.
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: "50kb" }));

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
