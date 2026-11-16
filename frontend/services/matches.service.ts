import type { MatchBand } from "@lf/shared";
import type { StaffMatchesResponse } from "@/interfaces";
import { http } from "./api-client";

/** Staff-only endpoints. */
export const matchesService = {
  list: (band?: MatchBand) => http.get<StaffMatchesResponse>(`/matches${band ? `?band=${band}` : ""}`),
  confirm: (lostId: string, foundId: string) => http.post("/matches/confirm", { lostId, foundId }),
  reject: (lostId: string, foundId: string) => http.post("/matches/reject", { lostId, foundId }),
  undo: (lostId: string, foundId: string) => http.post("/matches/undo", { lostId, foundId }),
  markReturned: (lostId: string, foundId: string) => http.post("/matches/returned", { lostId, foundId, verified: true }),
};
