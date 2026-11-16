"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useAiStatus } from "@/hooks/useAiStatus";
import type { ExtractResponse } from "@/interfaces";
import { assistService } from "@/services";
import { ACCEPTED_PHOTO_TYPES, resizePhoto } from "@/utils/image";
import { Button, FieldError } from "@/components/ui";

/**
 * Optional, staff-only photo. LOST: a photo from *before* it was lost (strong ownership evidence).
 * FOUND: a photo of the item as found. Used by staff to verify – never to score matches.
 */
export function PhotoField({
  isLost,
  photo,
  error,
  onChange,
  onSuggestion,
}: {
  isLost: boolean;
  photo: Blob | null;
  error?: string;
  onChange: (photo: Blob | null) => void;
  onSuggestion: (s: ExtractResponse) => void;
}) {
  const toast = useToast();
  const aiEnabled = useAiStatus();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<"resizing" | "reading" | null>(null);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      toast("Please choose a JPEG, PNG or WebP photo.", { tone: "error" });
      return;
    }
    setBusy("resizing");
    try {
      onChange(await resizePhoto(file));
    } catch {
      toast("Couldn’t read that photo. Try another one.", { tone: "error" });
    } finally {
      setBusy(null);
      if (input.current) input.current.value = "";
    }
  }

  async function suggestFromPhoto() {
    if (!photo) return;
    setBusy("reading");
    try {
      const s = await assistService.extractFromPhoto(photo);
      if (s.source !== "ai" || (!s.subcategory && !s.colorFamily && !s.brand)) {
        toast("Couldn’t read the photo – please fill the fields yourself.", { tone: "info" });
        return;
      }
      onSuggestion(s);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn’t read the photo", { tone: "error" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <label htmlFor="photo">
        {isLost ? "A photo of your item from before you lost it" : "A photo of the item"}{" "}
        <span className="font-normal text-stone-400">(optional)</span>
      </label>
      <p className="mt-0.5 text-xs text-stone-500">
        <strong className="font-medium text-stone-700">Only staff see it</strong>
        {isLost
          ? " – an old photo showing stickers, scratches or your case helps prove it’s yours."
          : " – it helps staff check the owner’s description."}{" "}
        It is never shown publicly and is not used to score matches.
      </p>

      <input
        ref={input}
        id="photo"
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {preview ? (
        <div className="mt-2 flex flex-wrap items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          <img src={preview} alt="Selected item photo" className="h-28 w-36 rounded-lg object-cover ring-1 ring-stone-200" />
          <div className="flex flex-col gap-1.5">
            {aiEnabled && (
              <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={suggestFromPhoto} disabled={!!busy}>
                {busy === "reading" ? "Reading photo…" : "✨ Suggest fields from photo"}
              </Button>
            )}
            <Button type="button" variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => input.current?.click()} disabled={!!busy}>
              Replace
            </Button>
            <Button type="button" variant="ghost" className="px-3 py-1.5 text-xs text-red-700" onClick={() => onChange(null)} disabled={!!busy}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={!!busy}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-600 hover:border-accent-500 hover:bg-accent-50/40"
        >
          {busy === "resizing" ? "Preparing photo…" : "📷 Add a photo"}
        </button>
      )}
      <FieldError message={error} />
    </div>
  );
}
