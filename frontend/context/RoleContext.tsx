"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, UNAUTHORIZED_EVENT } from "@/services";
import type { Role } from "@/utils/storage";

interface RoleState {
  /** Comes from the server's session check – never from anything the browser can set. */
  role: Role;
  /** False until the server has answered, so pages don't flash the wrong view. */
  ready: boolean;
  staffLoginEnabled: boolean;
  signIn: (passcode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const RoleContext = createContext<RoleState>({
  role: "student",
  ready: false,
  staffLoginEnabled: true,
  signIn: async () => {},
  signOut: async () => {},
});

/** Students need no account. Staff sign in with a passcode and get an httpOnly session cookie. */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("student");
  const [ready, setReady] = useState(false);
  const [staffLoginEnabled, setStaffLoginEnabled] = useState(true);

  useEffect(() => {
    authService
      .me()
      .then((me) => {
        setRole(me.role);
        setStaffLoginEnabled(me.staffLoginEnabled);
      })
      .catch(() => setRole("student"))
      .finally(() => setReady(true));

    // Session expired or missing on a staff request → fall back to the student view.
    const onUnauthorized = () => setRole("student");
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const signIn = useCallback(async (passcode: string) => {
    const res = await authService.login(passcode);
    setRole(res.role);
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout().catch(() => {});
    setRole("student");
  }, []);

  return <RoleContext.Provider value={{ role, ready, staffLoginEnabled, signIn, signOut }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
