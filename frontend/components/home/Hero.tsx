import Link from "next/link";
import { QuickLookup } from "./QuickLookup";

/** The problem in one line, the two actions, and a shortcut for people who already reported. */
export function Hero() {
  return (
    <section className="grid items-center gap-8 lg:grid-cols-[1fr,360px]">
      <div>
        <p className="text-sm font-medium text-accent-700">University Lost &amp; Found</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Lost something on campus? Found something?
        </h1>
        <p className="mt-3 max-w-xl text-stone-600">
          People describe the same item in different words. We match reports by meaning, colour, place and time – and staff
          check ownership before anything is handed over.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/report/new?type=lost"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-accent-700"
          >
            <span aria-hidden>🔍</span> I lost something
          </Link>
          <Link
            href="/report/new?type=found"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-stone-800 shadow-sm ring-1 ring-inset ring-stone-300 hover:bg-stone-50"
          >
            <span aria-hidden>🤲</span> I found something
          </Link>
        </div>
        <p className="mt-3 text-xs text-stone-500">Takes about two minutes. “Not sure” is always an option.</p>
      </div>
      <QuickLookup />
    </section>
  );
}
