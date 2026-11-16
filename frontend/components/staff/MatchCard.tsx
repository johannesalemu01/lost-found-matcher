import type { Report } from "@lf/shared";
import { SUBCATEGORY_LABELS, locationLabel } from "@lf/shared";
import type { StaffMatch } from "@/interfaces";
import { formatEventTime } from "@/utils/format";
import { BandBadge, Button, Card, ReasonList, ScoreBar } from "@/components/ui";
import { SectionLabel, VerifyPanel } from "./VerifyPanel";

/**
 * One candidate for the selected lost report. The lost report is shown once above the
 * list, so the card focuses on the found item, why it matched, and how to verify.
 */
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
  const found = match.found;
  return (
    <Card className="overflow-hidden">
      {/* Header: the found item at a glance */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <BandBadge band={match.band} />
            <ScoreBar score={match.score} band={match.band} />
          </div>
          <h3 className="mt-2 font-semibold text-stone-900">
            <span className="mr-1.5 rounded bg-accent-50 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent-700">
              Found
            </span>
            {found.title}
          </h3>
          {found.description && <p className="mt-0.5 text-sm text-stone-600">{found.description}</p>}
          <p className="mt-1 text-xs text-stone-500">
            {SUBCATEGORY_LABELS[found.subcategory]} · {found.locations.map(locationLabel).join(", ")} · {formatEventTime(found)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Finder: <span className="text-stone-700">{found.contactName}</span> · {found.contactEmailOrPhone}
          </p>
        </div>
      </div>

      {/* Body: evidence for and against, next to the ownership check */}
      <div className="grid gap-5 px-4 py-4 sm:px-5 md:grid-cols-2">
        <div className="space-y-2">
          <SectionLabel>Why it was suggested</SectionLabel>
          <ReasonList reasons={match.reasons} cap={match.cap} showPoints />
        </div>
        <VerifyPanel lost={lost} found={found} question={match.verificationQuestion} />
      </div>

      {/* Footer: the decision */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 bg-stone-50/60 px-4 py-3 sm:px-5">
        <p className="mr-auto text-xs text-stone-500">Confirm only after comparing the private details.</p>
        <Button variant="secondary" className="px-3 py-1.5" onClick={onReject} disabled={busy}>
          Not a match
        </Button>
        <Button className="px-3 py-1.5" onClick={onConfirm} disabled={busy}>
          Confirm match
        </Button>
      </div>
    </Card>
  );
}
