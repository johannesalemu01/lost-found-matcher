import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { RecentFound } from "./RecentFound";
import { StatsRow } from "./StatsRow";

export function HomePage() {
  return (
    <div className="space-y-12">
      <Hero />
      <StatsRow />
      <RecentFound />
      <HowItWorks />
      <p className="flex items-start gap-2 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
        <span aria-hidden>🔒</span>
        <span>
          Your contact details, the private detail you add and any photo are only ever seen by Lost &amp; Found staff – never by other
          students – so nobody can claim your item by copying the public listing.
        </span>
      </p>
    </div>
  );
}
