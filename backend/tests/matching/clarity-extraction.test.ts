import { describe, expect, it } from "vitest";
import { assessClarity, extractFields, verificationQuestion } from "../../src/matching";

describe("clarity check (rule-based, no AI)", () => {
  it('vague "lost my bag somewhere" returns follow-up questions', () => {
    const r = assessClarity({
      type: "LOST",
      subcategory: "OTHER_BAG",
      title: "Bag",
      description: "lost my bag somewhere",
      colorFamily: "UNKNOWN",
      locations: ["NOT_SURE"],
    });
    expect(r.level).toBe("vague");
    expect(r.questions.length).toBeGreaterThanOrEqual(1);
    expect(r.questions.length).toBeLessThanOrEqual(3);
    expect(r.questions.join(" ")).toMatch(/colour/i);
  });

  it("a detailed description needs no questions", () => {
    const r = assessClarity({
      type: "LOST",
      subcategory: "EARBUDS_HEADPHONES",
      title: "AirPods Pro case",
      description: "White AirPods Pro case with a small cat sticker and a scratch on the lid",
      colorFamily: "WHITE_LIGHT",
      locations: ["CAFETERIA"],
    });
    expect(r).toEqual({ level: "good", questions: [] });
  });
});

describe("rule-based field extraction", () => {
  it("suggests subcategory, colour and brand from free text", () => {
    expect(extractFields("Black backpack containing a laptop charger")).toMatchObject({
      subcategory: "BACKPACK",
      colorFamily: "BLACK_DARK",
    });
    expect(extractFields("white AirPods case with a cat sticker")).toMatchObject({
      subcategory: "EARBUDS_HEADPHONES",
      colorFamily: "WHITE_LIGHT",
      brand: "Apple",
      features: expect.arrayContaining(["case", "cat", "sticker"]),
    });
    expect(extractFields("my student id card")).toMatchObject({ subcategory: "STUDENT_ID" });
  });
});

describe("verification question", () => {
  it("asks something only the owner would know", () => {
    expect(verificationQuestion("EARBUDS_HEADPHONES")).toBe("Ask the owner: what is on the back of the case?");
    expect(verificationQuestion("BACKPACK")).toBe("Ask the owner: what was inside the bag?");
  });
});
