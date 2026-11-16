"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { STORAGE_KEYS } from "@/config/constants";
import { readStorage, writeStorage } from "@/utils/storage";
import { isValidContact } from "@/utils/validation";
import { Button, Card, FieldError } from "@/components/ui";

/** "Already reported?" – jump straight to My reports with the email or phone filled in. */
export function QuickLookup() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    const saved = readStorage(STORAGE_KEYS.contact);
    if (saved) setContact(saved);
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!isValidContact(contact)) return setError("Enter the email or phone you used on your report");
    writeStorage(STORAGE_KEYS.contact, contact.trim());
    router.push("/my-reports");
  }

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-stone-900">Already reported something?</h2>
      <p className="mt-1 text-sm text-stone-600">See its status and whether a match was found.</p>
      <form onSubmit={submit} className="mt-4 space-y-2">
        <label htmlFor="home-contact" className="sr-only">
          Email or phone
        </label>
        <input
          id="home-contact"
          className="w-full"
          placeholder="you@university.edu or +251 9…"
          value={contact}
          onChange={(e) => {
            setContact(e.target.value);
            setError(undefined);
          }}
          aria-invalid={!!error}
        />
        <FieldError message={error} />
        <Button type="submit" variant="secondary" className="w-full">
          Check my reports →
        </Button>
      </form>
    </Card>
  );
}
