import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { apiRoutes } from "./routes";

export function createApp({ corsOrigins }: { corsOrigins: string[] }) {
  const app = express();
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "50kb" }));

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
