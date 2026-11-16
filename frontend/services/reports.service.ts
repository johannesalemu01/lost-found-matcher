import type { PublicReport, Report } from "@lf/shared";
import type {
  CreateReportRequest,
  CreatedReportResponse,
  MyReportItem,
  ReportFilters,
  StaffReport,
} from "@/interfaces";
import { http } from "./api-client";

export const reportsService = {
  /** JSON, or multipart when a photo is attached (fields go in "data" as JSON). */
  create: (input: CreateReportRequest, photo?: Blob | null) => {
    if (!photo) return http.post<CreatedReportResponse>("/reports", input);
    const form = new FormData();
    form.append("data", JSON.stringify(input));
    form.append("photo", photo, "photo.jpg");
    return http.postForm<CreatedReportResponse>("/reports", form);
  },

  /** Staff only. */
  photo: (id: string) => http.blob(`/reports/${id}/photo`),

  list: (filters: ReportFilters) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
    return http.get<{ reports: (PublicReport | StaffReport)[] }>(`/reports?${qs}`);
  },

  mine: (contact: string) => http.get<{ reports: MyReportItem[] }>(`/reports/mine?contact=${encodeURIComponent(contact)}`),

  close: (id: string) => http.post<{ report: Report }>(`/reports/${id}/close`),
};
