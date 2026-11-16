import Link from "next/link";

/** The two big entry points: "I lost something" / "I found something". */
export function ActionCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <Link
        href="/report/new?type=lost"
        className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-card transition hover:border-rose-300 hover:shadow-md"
      >
        <span className="text-3xl" aria-hidden>
          🔍
        </span>
        <h2 className="mt-3 text-xl font-semibold text-stone-900">I lost something</h2>
        <p className="mt-1 text-sm text-stone-600">Describe it as best you can. A rough time and place is fine.</p>
        <span className="mt-4 inline-block text-sm font-medium text-rose-700 group-hover:underline">Report a lost item →</span>
      </Link>
      <Link
        href="/report/new?type=found"
        className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-card transition hover:border-accent-200 hover:shadow-md"
      >
        <span className="text-3xl" aria-hidden>
          🤲
        </span>
        <h2 className="mt-3 text-xl font-semibold text-stone-900">I found something</h2>
        <p className="mt-1 text-sm text-stone-600">Tell us what and where. Keep one detail back so only the owner can prove it.</p>
        <span className="mt-4 inline-block text-sm font-medium text-accent-700 group-hover:underline">Report a found item →</span>
      </Link>
    </section>
  );
}
