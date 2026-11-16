import type { ClarityRequest, ClarityResponse, ExtractResponse } from "@/interfaces";
import { http } from "./api-client";

/** Optional helpers – AI if the server has a key, keyword rules otherwise. */
export const assistService = {
  extract: (text: string) => http.post<ExtractResponse>("/assist/extract", { text }),
  clarity: (input: ClarityRequest) => http.post<ClarityResponse>("/assist/clarity", input),
};
