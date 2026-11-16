import { FUTURE_TOLERANCE_MS } from "@/config/constants";
import type { ReportFormErrors, ReportFormState } from "@/interfaces";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s\-().]{7,20}$/;

export function isValidContact(value: string): boolean {
  const c = value.trim();
  return EMAIL.test(c) || (PHONE.test(c) && c.replace(/\D/g, "").length >= 7);
}

/**
 * Client-side checks for one step of the report form, for instant feedback.
 * The server validates everything again (Zod) and its field errors are shown the same way.
 */
export function validateReportStep(step: number, form: ReportFormState, isLost: boolean): ReportFormErrors {
  const e: ReportFormErrors = {};
  if (step === 0) {
    if (!form.subcategory) e.subcategory = "Choose what kind of item it is";
    if (form.title.trim().length < 3) e.title = "Give it a short title (at least 3 characters)";
  }
  if (step === 1) {
    if (form.locations.length === 0) e.locations = "Pick at least one place, or “Not sure”";
    const start = new Date(form.start);
    const end = new Date(isLost ? form.end : form.start);
    const latest = Date.now() + FUTURE_TOLERANCE_MS;
    if (!form.start || Number.isNaN(start.getTime())) e.eventStart = "Choose a date and time";
    else if (start.getTime() > latest) e.eventStart = "This can’t be in the future";
    if (isLost) {
      if (!form.end || Number.isNaN(end.getTime())) e.eventEnd = "Choose a date and time";
      else if (end.getTime() > latest) e.eventEnd = "This can’t be in the future";
      else if (end < start) e.eventEnd = "The end must be after the start";
    }
  }
  if (step === 2) {
    if (form.contactName.trim().length < 2) e.contactName = "Tell us your name";
    if (!isValidContact(form.contactEmailOrPhone)) e.contactEmailOrPhone = "Enter a valid email address or phone number";
  }
  return e;
}

/** Which form step each server-side field error belongs to. */
export const FIELD_STEP: Record<string, number> = {
  subcategory: 0,
  title: 0,
  description: 0,
  colorFamily: 0,
  brand: 0,
  locations: 1,
  eventStart: 1,
  eventEnd: 1,
  privateDetail: 1,
  photo: 0,
  contactName: 2,
  contactEmailOrPhone: 2,
};
