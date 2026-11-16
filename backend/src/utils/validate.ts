import type { ZodType } from "zod";
import { badRequest } from "./errors";

/** Parse input with a Zod schema, or throw a 400 with one message per field. */
export function validate<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".") || "_";
    if (!fields[path]) fields[path] = issue.message;
  }
  throw badRequest("Please check the highlighted fields.", fields);
}
