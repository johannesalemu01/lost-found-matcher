import type { StepProps } from "@/interfaces";
import { FieldError } from "@/components/ui";

/** Step 3 – "Contact": visible to staff only. */
export function ContactStep({ form, errors, set }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-stone-600">
        Only Lost &amp; Found staff can see your contact details. Use the same email or phone on “My reports” to follow progress.
      </p>
      <div>
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          className="mt-1.5 w-full"
          maxLength={80}
          autoComplete="name"
          value={form.contactName}
          onChange={(e) => set("contactName", e.target.value)}
        />
        <FieldError message={errors.contactName} />
      </div>
      <div>
        <label htmlFor="contact">Email or phone</label>
        <input
          id="contact"
          className="mt-1.5 w-full"
          maxLength={120}
          autoComplete="email"
          placeholder="you@university.edu or +251 9…"
          value={form.contactEmailOrPhone}
          onChange={(e) => set("contactEmailOrPhone", e.target.value)}
        />
        <FieldError message={errors.contactEmailOrPhone} />
      </div>
    </div>
  );
}
