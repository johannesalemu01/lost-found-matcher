import { z } from "zod";

export const staffLoginSchema = z.object({
  passcode: z.string({ error: "Enter the staff passcode" }).min(1, "Enter the staff passcode").max(200),
});
