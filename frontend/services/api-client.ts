import { API_URL } from "@/config/env";
import { getStoredRole } from "@/utils/storage";

/** An API error with the server's per-field messages (from Zod) when there are any. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        // Stand-in for real auth – see README.
        "x-role": getStoredRole(),
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(`Can’t reach the server. Is the backend running on ${API_URL}?`, 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body?.error?.message ?? `Request failed (${res.status})`, res.status, body?.error?.fields ?? {});
  }
  return body as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown = {}) => request<T>(path, { method: "POST", body: JSON.stringify(data) }),
};
