import type { Category, ColorFamily, Subcategory } from "@lf/shared";

/** State of the 3-step report form. Dates are datetime-local strings in the viewer's time zone. */
export interface ReportFormState {
  category: Category | null;
  subcategory: Subcategory | null;
  title: string;
  description: string;
  colorFamily: ColorFamily;
  brand: string;
  locations: string[];
  start: string;
  end: string;
  privateDetail: string;
  /** Optional staff-only photo, already resized in the browser. */
  photo: Blob | null;
  contactName: string;
  contactEmailOrPhone: string;
}

/** Field errors, keyed by form field or by the API field name (eventStart/eventEnd). */
export type ReportFormErrors = Partial<Record<keyof ReportFormState | "eventStart" | "eventEnd", string>>;

/** Props every form step receives. */
export interface StepProps {
  form: ReportFormState;
  errors: ReportFormErrors;
  isLost: boolean;
  set: <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => void;
  update: (patch: Partial<ReportFormState>, clear?: (keyof ReportFormErrors)[]) => void;
}
