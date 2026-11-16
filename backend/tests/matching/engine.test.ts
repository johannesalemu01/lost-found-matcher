import { describe, expect, it } from "vitest";
import { evaluatePair, findMatchesFor, pairKey, type MatchableReport, type MatchContext } from "../../src/matching";
import { at, found, lost } from "../fixtures/reports";

const ctx: MatchContext = { now: at(16, 9) }; // two weeks and a bit after "Monday"

function scored(a: MatchableReport, b: MatchableReport, c: MatchContext = ctx) {
  const evaluation = evaluatePair(a, b, c);
  if (!evaluation.ok) throw new Error(`Expected a scored pair, got hard rule ${evaluation.rule}`);
  return evaluation.result;
}

function reasonFor(result: ReturnType<typeof scored>, key: string) {
  return result.reasons.find((r) => r.key === key)!;
}

// The lost backpack from the brief, reused by several tests.
const lostBackpack = lost({
  title: "Black backpack",
  description: "Black backpack containing a laptop charger, lost in the library on Monday afternoon",
  locations: ["MAIN_LIBRARY"],
  eventStart: at(0, 12),
  eventEnd: at(0, 17),
});

describe("brief scenarios", () => {
  it("lost black backpack (library) vs dark backpack (library entrance, same evening) => STRONG", () => {
    const f = found({
      title: "Dark-coloured backpack",
      description: "Dark-coloured backpack near the library entrance Monday evening",
      locations: ["LIBRARY_ENTRANCE"],
      eventStart: at(0, 19),
    });
    const r = scored(lostBackpack, f);
    expect(r.band).toBe("STRONG");
    expect(reasonFor(r, "category").reason).toBe("Same item type: Backpack");
    expect(reasonFor(r, "colour").reason).toBe("Colour: black ≈ dark");
    expect(reasonFor(r, "location")).toMatchObject({
      points: 9,
      reason: "Location: Main Library is next to Library Entrance",
    });
    expect(reasonFor(r, "time")).toMatchObject({ points: 15, reason: "Found 2 hours after the lost window" });
  });

  it("same lost backpack vs black backpack at the football field two weeks later => WEAK or hidden", () => {
    const f = found({
      title: "Black backpack",
      description: "Black backpack at the football field two weeks later",
      locations: ["FOOTBALL_FIELD"],
      eventStart: at(14, 17),
    });
    const r = scored(lostBackpack, f);
    expect([null, "WEAK"]).toContain(r.band);
    expect(reasonFor(r, "location")).toMatchObject({ points: 0, reason: expect.stringContaining("not nearby") });
    expect(reasonFor(r, "time")).toMatchObject({ points: 0, reason: "Found 14 days after the lost window" });
    expect(reasonFor(r, "plausibility").kind).toBe("conflict");
  });

  it("black AirPods case (cafeteria) vs dark wireless earbud case (coffee shop) => STRONG", () => {
    const l = lost({
      subcategory: "EARBUDS_HEADPHONES",
      title: "AirPods case",
      description: "black AirPods case near the cafeteria",
      locations: ["CAFETERIA"],
      eventStart: at(1, 9),
      eventEnd: at(1, 13),
    });
    const f = found({
      subcategory: "EARBUDS_HEADPHONES",
      title: "Earbud case",
      description: "dark wireless earbud case beside the coffee shop",
      locations: ["COFFEE_SHOP"],
      eventStart: at(1, 12),
    });
    const r = scored(l, f);
    expect(r.band).toBe("STRONG");
    expect(reasonFor(r, "text").reason).toBe("Similar words: audio, case");
    expect(reasonFor(r, "colour").reason).toBe("Colour: black ≈ dark");
    expect(reasonFor(r, "location").reason).toBe("Location: Cafeteria is next to Coffee Shop");
  });
});

describe("hard rules (impossible matches)", () => {
  it("found before it was lost => no match", () => {
    const f = found({ eventStart: at(0, 9) }); // window starts 12:00, 1h tolerance → 11:00
    const e = evaluatePair(lostBackpack, f, ctx);
    expect(e).toMatchObject({ ok: false, rule: "FOUND_BEFORE_LOST" });
    expect(findMatchesFor(lostBackpack, [f], ctx)).toEqual([]);
  });

  it("allows a find up to 1 hour before the window (people misremember)", () => {
    const f = found({ eventStart: at(0, 11, 30) });
    expect(scored(lostBackpack, f).reasons.find((r) => r.key === "time")!.points).toBe(15);
  });

  it("lost phone vs found earbuds => no match", () => {
    const l = lost({ subcategory: "PHONE", title: "Black phone", description: "Black iPhone" });
    const f = found({ subcategory: "EARBUDS_HEADPHONES", title: "Black earbuds", description: "Black earbuds" });
    expect(evaluatePair(l, f, ctx)).toMatchObject({ ok: false, rule: "INCOMPATIBLE_CATEGORY" });
  });

  it("a pair rejected by staff is not suggested again", () => {
    const f = found({ title: "Black backpack", locations: ["MAIN_LIBRARY"] });
    expect(findMatchesFor(lostBackpack, [f], ctx)).toHaveLength(1);
    const after = { ...ctx, rejectedPairs: new Set([pairKey(lostBackpack.id, f.id)]) };
    expect(findMatchesFor(lostBackpack, [f], after)).toEqual([]);
    expect(evaluatePair(lostBackpack, f, after)).toMatchObject({ ok: false, rule: "PREVIOUSLY_REJECTED" });
  });

  it("excludes a report that has been OPEN for more than 30 days", () => {
    const old = lost({ eventStart: at(-41, 10), eventEnd: at(-41, 12), createdAt: at(-40, 9) });
    const f = found({ eventStart: at(-41, 13) });
    expect(evaluatePair(old, f, ctx)).toMatchObject({ ok: false, rule: "EXPIRED" });
  });

  it("excludes reports that are no longer OPEN", () => {
    const f = found({ status: "MATCH_PENDING" });
    expect(evaluatePair(lostBackpack, f, ctx)).toMatchObject({ ok: false, rule: "NOT_OPEN" });
  });

  it("excludes finds more than 30 days after the lost window", () => {
    // Reported a few days after losing it, so the lost report itself is not expired yet.
    const l = lost({ createdAt: at(5, 9) });
    const f = found({ eventStart: at(31, 18) });
    const later = { now: at(32, 9) };
    expect(evaluatePair(l, f, later)).toMatchObject({ ok: false, rule: "FOUND_TOO_LATE" });
  });
});

describe("scoring components", () => {
  it('"Not sure" location gives the neutral 7 points, not 0', () => {
    const f = found({ locations: ["NOT_SURE"] });
    expect(reasonFor(scored(lostBackpack, f), "location")).toMatchObject({
      points: 7,
      kind: "neutral",
      reason: "Location unknown",
    });
  });

  it("colour conflict scores 0, is flagged and caps the band at POSSIBLE", () => {
    const l = lost({ title: "Red backpack", description: "Red backpack", colorFamily: "RED_PINK" });
    const f = found({ title: "Black backpack", description: "Black backpack" });
    const r = scored(l, f);
    expect(reasonFor(r, "colour")).toMatchObject({ points: 0, kind: "conflict", reason: "⚠ Colour conflict: red vs black" });
    expect(r.band).not.toBe("STRONG");
    expect(r.score).toBeLessThanOrEqual(69);
  });

  it('unknown colour is neutral (7), and colour words in the text are used when the swatch is "Not sure"', () => {
    const f1 = found({ colorFamily: "UNKNOWN", title: "Backpack", description: "Backpack" });
    expect(reasonFor(scored(lostBackpack, f1), "colour")).toMatchObject({ points: 7, kind: "neutral" });
    const f2 = found({ colorFamily: "UNKNOWN", title: "Navy backpack", description: "navy backpack" });
    const l2 = lost({ colorFamily: "UNKNOWN", title: "Blue backpack", description: "blue backpack" });
    expect(reasonFor(scored(l2, f2), "colour")).toMatchObject({ points: 15, reason: "Colour: blue ≈ navy" });
  });

  it('"Other bag" is compatible with Backpack but capped at POSSIBLE', () => {
    const l = lost({ subcategory: "OTHER_BAG", title: "Black bag", description: "Black bag with laptop charger" });
    const f = found({ title: "Black backpack", description: "Black backpack with a laptop charger inside" });
    const r = scored(l, f);
    expect(reasonFor(r, "category")).toMatchObject({ points: 10, kind: "neutral" });
    expect(r.band).toBe("POSSIBLE");
    expect(r.cap).toContain("Other");
  });

  it("time points decay after the 6 hour grace period", () => {
    const sameDay = scored(lostBackpack, found({ eventStart: at(0, 22) }));
    const weekLater = scored(lostBackpack, found({ eventStart: at(7, 17) }));
    expect(reasonFor(sameDay, "time").points).toBe(15);
    expect(reasonFor(weekLater, "time").points).toBeGreaterThan(0);
    expect(reasonFor(weekLater, "time").points).toBeLessThan(15);
  });

  it("a different brand is a conflict, the same brand a bonus", () => {
    const l = lost({ subcategory: "PHONE", title: "Phone", description: "black phone", brand: "Samsung" });
    const same = scored(l, found({ subcategory: "PHONE", title: "Phone", description: "black phone", brand: "samsung" }));
    const diff = scored(l, found({ subcategory: "PHONE", title: "Phone", description: "black phone", brand: "Tecno" }));
    expect(reasonFor(same, "text").reason).toContain("same brand");
    expect(reasonFor(diff, "brand")).toMatchObject({ kind: "conflict", reason: "⚠ Brand conflict: Samsung vs Tecno" });
  });

  it("findMatchesFor works in both directions and sorts best first", () => {
    const good = found({ title: "Black backpack", description: "black backpack laptop charger" });
    const okay = found({ title: "Backpack", description: "backpack", colorFamily: "UNKNOWN", locations: ["GYM"] });
    const fromLost = findMatchesFor(lostBackpack, [okay, good], ctx);
    expect(fromLost.map((m) => m.foundId)).toEqual([good.id, okay.id]);
    const fromFound = findMatchesFor(good, [lostBackpack], ctx);
    expect(fromFound[0]).toMatchObject({ lostId: lostBackpack.id, foundId: good.id, score: fromLost[0].score });
  });
});
