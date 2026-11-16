/**
 * Matching module – the engine. Pure TypeScript: no Express, no Prisma, no I/O.
 * Everything here is deterministic and unit-tested; the optional AI (assist module)
 * only pre-fills form fields and never decides a match.
 *
 *   constants.ts     weights, time rules, bands
 *   concepts.ts      vocabulary: synonyms → concepts, stop words, brands
 *   normalize.ts     free text → concept tokens + colour mentions
 *   rules.ts         hard rules (impossible pairs)
 *   scoring.ts       the five scored components
 *   engine.ts        pair pipeline, caps, bands, findMatchesFor
 *   clarity.ts       follow-up questions for vague reports
 *   extraction.ts    rule-based "Suggest fields"
 *   verification.ts  question staff ask before handover
 */
export { normalize, stem } from "./normalize";
export { checkHardRules, type HardRule } from "./rules";
export { evaluatePair, findMatchesFor, bandFor, type PairEvaluation } from "./engine";
export { assessClarity, type ClarityInput, type ClarityResult, type ClarityLevel } from "./clarity";
export { extractFields, type ExtractedFields } from "./extraction";
export { verificationQuestion } from "./verification";
export { WEIGHTS, TIME_RULES, BANDS } from "./constants";
export { pairKey, type MatchableReport, type MatchContext } from "./types";
