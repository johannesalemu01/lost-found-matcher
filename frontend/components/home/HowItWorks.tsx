const STEPS = [
  { icon: "📝", title: "Report", text: "A short guided form. Rough answers and “Not sure” are fine." },
  { icon: "🧩", title: "We suggest matches", text: "Reports are compared by item type, words, colour, place and time – every suggestion says why." },
  { icon: "🛡️", title: "Staff verify", text: "The owner answers a question only they could know, like what’s on the back of the case." },
  { icon: "🎉", title: "Collect", text: "Pick it up at the Lost & Found office with your student ID." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="space-y-4">
      <h2 id="how-it-works" className="text-lg font-semibold text-stone-900">
        How it works
      </h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-50 text-xs font-semibold text-accent-700">
                {i + 1}
              </span>
              <span aria-hidden>{s.icon}</span>
            </div>
            <h3 className="mt-3 font-medium text-stone-900">{s.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
