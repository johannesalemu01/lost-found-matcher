import type { Report } from "@lf/shared";
import { PhotoComparison } from "./PhotoComparison";
import { PrivateDetails } from "./PrivateDetails";

/** Everything staff use to check ownership: private details, photos and the question to ask. */
export function VerifyPanel({ lost, found, question }: { lost: Report; found: Report; question: string }) {
  return (
    <div className="space-y-3">
      <SectionLabel>Verify ownership</SectionLabel>
      <PrivateDetails lost={lost} found={found} />
      <PhotoComparison lost={lost} found={found} />
      <p className="flex gap-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-800 ring-1 ring-inset ring-stone-200">
        <span aria-hidden>💬</span>
        <span className="font-medium">{question}</span>
      </p>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{children}</p>;
}
