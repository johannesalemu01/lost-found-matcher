import type { Role } from "@/utils/storage";
import { http } from "./api-client";

/** Staff sign-in. The server answers with an httpOnly session cookie. */
export const authService = {
  me: () => http.get<{ role: Role; staffLoginEnabled: boolean }>("/auth/me"),
  login: (passcode: string) => http.post<{ role: Role }>("/auth/staff/login", { passcode }),
  logout: () => http.post<{ role: Role }>("/auth/logout"),
};
