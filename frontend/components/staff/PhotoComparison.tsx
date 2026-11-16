import type { Report } from "@lf/shared";
import { StaffPhoto } from "./StaffPhoto";

/** Owner's photo (from before the loss) next to the finder's photo. Verification only – not scored. */
export function PhotoComparison({ lost, found }: { lost: Report; found: Report }) {
  if (!lost.hasPhoto && !found.hasPhoto) return null;
  const slot = (report: Report, label: string) => (
    <figure>
      <figcaption className="mb-1 text-xs text-violet-700">{label}</figcaption>
      {report.hasPhoto ? (
        <StaffPhoto reportId={report.id} alt={label} className="h-32 w-full rounded-md ring-1 ring-violet-200" />
      ) : (
        <div className="grid h-32 place-items-center rounded-md border border-dashed border-violet-200 text-xs italic text-stone-400">
          No photo
        </div>
      )}
    </figure>
  );
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">📷 Photos – compare</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {slot(lost, "Owner’s photo (from before)")}
        {slot(found, "Finder’s photo")}
      </div>
      <p className="mt-2 text-xs text-stone-500">Same stickers, marks or wear? Photos support verification but never change the score.</p>
    </div>
  );
}
