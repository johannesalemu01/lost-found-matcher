import { STORAGE_KEYS } from "@/config/constants";

export type Role = "student" | "staff";

/** localStorage can throw (private mode, blocked storage) – every access is guarded. */
export function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore – it's only a convenience */
  }
}

export function getStoredRole(): Role {
  return readStorage(STORAGE_KEYS.role) === "staff" ? "staff" : "student";
}
