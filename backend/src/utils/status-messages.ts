import { displayStatus } from "@lf/shared";
import type { ReportRow } from "../interfaces";

/** The friendly one-liner a student sees on "My reports". */
export function statusMessage(r: ReportRow, matchCount: number, now: Date): string {
  const lost = r.type === "LOST";
  const matches = `${matchCount} possible match${matchCount === 1 ? "" : "es"}`;

  switch (displayStatus(r, now)) {
    case "EXPIRED":
      return "This report expired after 30 days without a match. Visit the Lost & Found office if you are still looking.";
    case "OPEN":
      if (matchCount > 0) {
        return lost ? `${matches}, staff are reviewing.` : `${matches} with an owner, staff are reviewing.`;
      }
      return lost
        ? "No matches yet. We check every new found report automatically."
        : "No owner yet. Please hand the item in at the Lost & Found office if you haven't already.";
    case "MATCH_PENDING":
      return lost
        ? "Match confirmed – collect at the Lost & Found office; bring your student ID."
        : "Owner found – staff will arrange the handover. Thank you!";
    case "RETURNED":
      return lost ? "Returned to you. Glad it found its way back!" : "Returned to its owner – thank you for handing it in!";
    case "CLOSED":
      return "Closed by staff.";
  }
}
