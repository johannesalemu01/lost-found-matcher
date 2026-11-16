"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { parentOf, type ReportType, type Subcategory } from "@lf/shared";
import { REPORT_FORM_STEPS, STORAGE_KEYS } from "@/config/constants";
import { useToast } from "@/context/ToastContext";
import { useClarityCheck } from "@/hooks/useClarityCheck";
import type { CreatedReportResponse, ReportFormErrors, ReportFormState, StepProps } from "@/interfaces";
import { ApiError, reportsService } from "@/services";
import { localInputToIso, toLocalInput } from "@/utils/format";
import { writeStorage } from "@/utils/storage";
import { FIELD_STEP, validateReportStep } from "@/utils/validation";
import { Button, Card } from "@/components/ui";
import { Stepper } from "./Stepper";
import { SubmittedView } from "./SubmittedView";
import { ItemStep } from "./steps/ItemStep";
import { PlaceTimeStep } from "./steps/PlaceTimeStep";
import { ContactStep } from "./steps/ContactStep";

function initialState(isLost: boolean, sub: Subcategory | null): ReportFormState {
  const now = new Date();
  return {
    category: sub ? parentOf(sub) : null,
    subcategory: sub,
    title: "",
    description: "",
    colorFamily: "UNKNOWN",
    brand: "",
    locations: [],
    start: toLocalInput(isLost ? new Date(now.getTime() - 3 * 3600_000) : now),
    end: toLocalInput(now),
    privateDetail: "",
    photo: null,
    contactName: "",
    contactEmailOrPhone: "",
  };
}

/** Guided 3-step report form: What is it? → Where & when? → Contact. */
export function ReportWizard({ type, initialSubcategory = null }: { type: ReportType; initialSubcategory?: Subcategory | null }) {
  const toast = useToast();
  const isLost = type === "LOST";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ReportFormState>(() => initialState(isLost, initialSubcategory));
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreatedReportResponse | null>(null);
  const clarity = useClarityCheck(type, form);

  // Each step starts at the top of the page (mobile users would otherwise land mid-form).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const update: StepProps["update"] = (patch, clear) => {
    setForm((f) => ({ ...f, ...patch }));
    const keys = clear ?? (Object.keys(patch) as (keyof ReportFormErrors)[]);
    setErrors((e) => ({ ...e, ...Object.fromEntries(keys.map((k) => [k, undefined])) }));
  };
  const set: StepProps["set"] = (key, value) => update({ [key]: value } as Partial<ReportFormState>);

  function next() {
    const e = validateReportStep(step, form, isLost);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  }

  async function submit() {
    const e = validateReportStep(2, form, isLost);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      const res = await reportsService.create({
        type,
        subcategory: form.subcategory!,
        title: form.title,
        description: form.description,
        colorFamily: form.colorFamily,
        brand: form.brand,
        locations: form.locations,
        eventStart: localInputToIso(form.start),
        eventEnd: localInputToIso(isLost ? form.end : form.start),
        privateDetail: form.privateDetail,
        contactName: form.contactName,
        contactEmailOrPhone: form.contactEmailOrPhone,
      }, form.photo);
      writeStorage(STORAGE_KEYS.contact, form.contactEmailOrPhone.trim());
      setResult(res);
    } catch (err) {
      // Server-side field errors: show them inline and jump to the first step that has one.
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) {
        setErrors(err.fields as ReportFormErrors);
        setStep(Math.min(...Object.keys(err.fields).map((f) => FIELD_STEP[f] ?? 2)));
      }
      toast(err instanceof Error ? err.message : "Couldn’t submit the report", { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (result) return <SubmittedView type={type} result={result} />;

  const stepProps: StepProps = { form, errors, isLost, set, update };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
        ← Back
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">{isLost ? "Report a lost item" : "Report a found item"}</h1>
      <p className="mt-1 text-sm text-stone-600">
        {isLost
          ? "Describe it the way you remember it. Rough answers are fine – that’s what “Not sure” is for."
          : "Thank you for handing it in. Describe it publicly, but keep one detail back for verification."}
      </p>

      <Stepper steps={REPORT_FORM_STEPS} current={step} />

      <Card className="mt-6 p-5 sm:p-6">
        {step === 0 && <ItemStep {...stepProps} clarity={clarity} />}
        {step === 1 && <PlaceTimeStep {...stepProps} type={type} />}
        {step === 2 && <ContactStep {...stepProps} />}

        <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-5">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
              ← Back
            </Button>
          ) : (
            <span />
          )}
          {step < REPORT_FORM_STEPS.length - 1 ? (
            <Button onClick={next}>Continue →</Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit report"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
