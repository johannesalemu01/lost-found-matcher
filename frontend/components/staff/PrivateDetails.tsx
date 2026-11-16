import type { Report } from "@lf/shared";

/** Owner's secret vs finder's hidden detail, side by side – staff only. */
export function PrivateDetails({ lost, found }: { lost: Report; found: Report }) {
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">🔒 Private details – compare</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-violet-700">Owner says</p>
          <p className="text-stone-800">{lost.privateDetail || <span className="italic text-stone-400">Nothing given</span>}</p>
        </div>
        <div>
          <p className="text-xs text-violet-700">Finder noticed</p>
          <p className="text-stone-800">{found.privateDetail || <span className="italic text-stone-400">Nothing given</span>}</p>
        </div>
      </div>
    </div>
  );
}
