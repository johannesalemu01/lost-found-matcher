"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/config/constants";
import { getStoredRole, writeStorage, type Role } from "@/utils/storage";

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
  /** False until localStorage has been read, so pages don't flash the wrong view. */
  ready: boolean;
}

const RoleContext = createContext<RoleState>({ role: "student", setRole: () => {}, ready: false });

/** Student / Staff toggle, remembered on this device and sent to the API as `x-role`. */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRoleState(getStoredRole());
    setReady(true);
  }, []);

  const setRole = useCallback((next: Role) => {
    writeStorage(STORAGE_KEYS.role, next);
    setRoleState(next);
  }, []);

  return <RoleContext.Provider value={{ role, setRole, ready }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
