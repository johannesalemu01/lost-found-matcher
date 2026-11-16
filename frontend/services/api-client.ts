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

async function send(path: string, init: RequestInit = {}): Promise<Response> {
  // FormData sets its own multipart content type (with boundary); everything else is JSON.
  const isForm = init.body instanceof FormData;
  try {
    return await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: {
        ...(isForm ? {} : { "content-type": "application/json" }),
        // Stand-in for real auth – see README.
        "x-role": getStoredRole(),
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(`Can’t reach the server. Is the backend running on ${API_URL}?`, 0);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await send(path, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body?.error?.message ?? `Request failed (${res.status})`, res.status, body?.error?.fields ?? {});
  }
  return body as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown = {}) => request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
  /** Binary download (e.g. a staff-only photo), sent with the role header. */
  blob: async (path: string): Promise<Blob> => {
    const res = await send(path);
    if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
    return res.blob();
  },
};
