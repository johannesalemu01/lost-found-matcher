"use client";

import { useState, type FormEvent } from "react";
import { useRole } from "@/context/RoleContext";
import { ApiError } from "@/services";
import { Button, FieldError } from "@/components/ui";

/** Passcode form used in the header pop-over and on the staff page. */
export function StaffLoginForm({ onSuccess, autoFocus = false }: { onSuccess?: () => void; autoFocus?: boolean }) {
  const { signIn, staffLoginEnabled } = useRole();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!passcode) return setError("Enter the staff passcode");
    setBusy(true);
    setError(undefined);
    try {
      await signIn(passcode);
      setPasscode("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError && err.status !== 0 ? err.message : "Couldn’t sign in. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  if (!staffLoginEnabled) {
    return <p className="text-sm text-stone-600">Staff sign-in is not configured on the server (set STAFF_PASSCODE).</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="staff-passcode">Staff passcode</label>
      <div className="flex gap-2">
        <input
          id="staff-passcode"
          type="password"
          autoComplete="current-password"
          autoFocus={autoFocus}
          className="min-w-0 flex-1"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          aria-invalid={!!error}
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </div>
      <FieldError message={error} />
    </form>
  );
}
