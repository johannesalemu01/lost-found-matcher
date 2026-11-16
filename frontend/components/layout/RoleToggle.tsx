"use client";

import { useEffect, useRef, useState } from "react";
import { useRole } from "@/context/RoleContext";
import { useToast } from "@/context/ToastContext";
import { cx } from "@/utils/cx";
import { StaffLoginForm } from "./StaffLoginForm";

/** "Student" is the default; "Staff" requires signing in with the staff passcode. */
export function RoleToggle() {
  const { role, ready, signOut } = useRole();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  // Close the pop-over on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !panel.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ready) return <div className="ml-auto h-8 w-32" />;

  return (
    <div className="relative ml-auto flex items-center gap-2 text-xs" ref={panel}>
      {role === "staff" ? (
        <>
          <span className="rounded-full bg-accent-50 px-2.5 py-1 font-medium text-accent-800 ring-1 ring-inset ring-accent-200">
            Staff
          </span>
          <button
            className="rounded-md px-2 py-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            onClick={async () => {
              await signOut();
              toast("Signed out.", { tone: "info" });
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          className={cx(
            "rounded-md px-3 py-1.5 font-medium ring-1 ring-inset ring-stone-300 hover:bg-stone-50",
            open ? "bg-stone-100 text-stone-900" : "text-stone-600",
          )}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          Staff sign-in
        </button>
      )}

      {open && role !== "staff" && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
          <StaffLoginForm
            autoFocus
            onSuccess={() => {
              setOpen(false);
              toast("Signed in as staff.");
            }}
          />
        </div>
      )}
    </div>
  );
}
