import type { Report } from "@lf/shared";
import type { StaffMatch } from "@/interfaces";
import { BandBadge, Button, Card, ReasonList, ScoreBar } from "@/components/ui";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { ContactLine } from "./ContactLine";
import { PrivateDetails } from "./PrivateDetails";

/** One suggestion: lost vs found side by side, reasons, private details, verification question. */
export function MatchCard({
  lost,
  match,
  busy,
  onConfirm,
  onReject,
}: {
  lost: Report;
  match: StaffMatch;
  busy: boolean;
  onConfirm: () => void;
  onReject: () => void;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BandBadge band={match.band} />
          <ScoreBar score={match.score} band={match.band} />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="px-3 py-1.5" onClick={onReject} disabled={busy}>
            Not a match
          </Button>
          <Button className="px-3 py-1.5" onClick={onConfirm} disabled={busy}>
            Confirm
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-stone-200 p-3">
          <ReportSummary report={lost} />
          <ContactLine report={lost} />
        </div>
        <div className="rounded-lg border border-stone-200 p-3">
          <ReportSummary report={match.found} />
          <ContactLine report={match.found} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">Why it was suggested</p>
          <ReasonList reasons={match.reasons} cap={match.cap} showPoints />
        </div>
        <div className="space-y-3">
          <PrivateDetails lost={lost} found={match.found} />
          <p className="rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
            <span className="font-medium">💬 {match.verificationQuestion}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
