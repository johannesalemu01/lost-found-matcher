import { describe, expect, it } from "vitest";
import { normalize } from "../../src/matching";

describe("normalize", () => {
  it("maps different words for the same thing to one concept", () => {
    expect(normalize("black AirPods case").tokens).toEqual(["audio", "case"]);
    expect(normalize("wireless earbud case").tokens).toEqual(["wireless", "audio", "case"]);
    expect(normalize("Rucksack").tokens).toEqual(["bag"]);
    expect(normalize("My student ID card").tokens).toEqual(["idcard"]);
  });

  it("keeps colours, places and times out of the word tokens", () => {
    const n = normalize("Dark-coloured backpack near the library entrance Monday evening");
    expect(n.tokens).toEqual(["bag"]);
    expect(n.colours).toEqual([{ word: "dark", family: "BLACK_DARK" }]);
  });

  it('treats "dark blue" as blue, not black', () => {
    expect(normalize("dark blue jacket").colours).toEqual([{ word: "blue", family: "BLUE" }]);
    expect(normalize("navy hoodie").colours[0].family).toBe("BLUE");
  });
});
