import { ActionCards } from "./ActionCards";
import { StatsRow } from "./StatsRow";

const HOW_IT_WORKS = [
  { title: "1. Report", text: "A short guided form. “Not sure” is always an option." },
  { title: "2. We suggest matches", text: "Every suggestion says why: same item type, similar words, colour, place, time." },
  { title: "3. Staff verify", text: "The owner answers a question only they could know, then collects the item." },
];

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Lost something on campus? Found something?</h1>
        <p className="mt-3 text-stone-600">
          Two people rarely describe the same item the same way. We compare reports by meaning, colour, place and time, suggest
          likely matches, and staff verify ownership before anything is handed over.
        </p>
      </section>

      <ActionCards />
      <StatsRow />

      <section className="grid gap-6 border-t border-stone-200 pt-8 text-sm text-stone-600 sm:grid-cols-3">
        {HOW_IT_WORKS.map((s) => (
          <div key={s.title}>
            <h3 className="font-medium text-stone-900">{s.title}</h3>
            <p className="mt-1">{s.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
