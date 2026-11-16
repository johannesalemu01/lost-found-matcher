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
  create: (input: CreateReportRequest) => http.post<CreatedReportResponse>("/reports", input),

  list: (filters: ReportFilters) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
    return http.get<{ reports: (PublicReport | StaffReport)[] }>(`/reports?${qs}`);
  },

  mine: (contact: string) => http.get<{ reports: MyReportItem[] }>(`/reports/mine?contact=${encodeURIComponent(contact)}`),

  close: (id: string) => http.post<{ report: Report }>(`/reports/${id}/close`),
};
