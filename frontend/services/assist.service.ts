import type { ClarityRequest, ClarityResponse, ExtractResponse } from "@/interfaces";
import { http } from "./api-client";

/** Optional helpers – AI if the server has a key, keyword rules otherwise. */
export const assistService = {
  status: () => http.get<{ ai: boolean }>("/assist/status"),
  extract: (text: string) => http.post<ExtractResponse>("/assist/extract", { text }),
  /** Needs the AI; the photo is sent only when the person clicks the button. */
  extractFromPhoto: (photo: Blob) => {
    const form = new FormData();
    form.append("photo", photo, "photo.jpg");
    return http.postForm<ExtractResponse>("/assist/extract-photo", form);
  },
  clarity: (input: ClarityRequest) => http.post<ClarityResponse>("/assist/clarity", input),
};
