import type { StatsResponse } from "@/interfaces";
import { http } from "./api-client";

export const statsService = {
  get: () => http.get<StatsResponse>("/stats"),
};
