import { CATEGORIES, CATEGORY_INFO, type Category, type ReportType } from "@lf/shared";
import { cx } from "@/utils/cx";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "", label: "Any status" },
  { value: "MATCH_PENDING", label: "Match pending" },
  { value: "RETURNED", label: "Returned" },
  { value: "CLOSED", label: "Closed" },
  { value: "EXPIRED", label: "Expired" },
];

export interface ReportFilterState {
  type: ReportType;
  q: string;
  category: Category | "";
  status: string;
}

/** Lost | Found tabs, search box, category and status filters. */
export function ReportFilters({ value, onChange }: { value: ReportFilterState; onChange: (v: ReportFilterState) => void }) {
  const set = <K extends keyof ReportFilterState>(k: K, v: ReportFilterState[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="inline-flex shrink-0 self-start rounded-lg bg-stone-100 p-1" role="tablist">
        {(["LOST", "FOUND"] as ReportType[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={value.type === t}
            onClick={() => set("type", t)}
            className={cx(
              "rounded-md px-4 py-1.5 text-sm font-medium",
              value.type === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800",
            )}
          >
            {t === "LOST" ? "Lost" : "Found"}
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
        <input
          type="search"
          placeholder="Search: backpack, AirPods, keys…"
          className="min-w-0 flex-1"
          value={value.q}
          onChange={(e) => set("q", e.target.value)}
          aria-label="Search"
        />
        <select value={value.category} onChange={(e) => set("category", e.target.value as Category | "")} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_INFO[c].icon} {CATEGORY_INFO[c].label}
            </option>
          ))}
        </select>
        <select value={value.status} onChange={(e) => set("status", e.target.value)} aria-label="Status">
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
