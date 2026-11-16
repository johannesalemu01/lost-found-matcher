"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** "+ Report" in the header: start a lost or found report from any page. */
export function ReportMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = (href: string, icon: string, title: string, text: string) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-stone-50 focus:bg-stone-50 focus:outline-none"
      role="menuitem"
    >
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium text-stone-900">{title}</span>
        <span className="block text-xs text-stone-500">{text}</span>
      </span>
    </Link>
  );

  return (
    <div className="relative" ref={root}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-700 sm:text-sm"
      >
        + Report<span className="hidden sm:inline"> an item</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
          {item("/report/new?type=lost", "🔍", "I lost something", "Describe it – we’ll look for matches")}
          {item("/report/new?type=found", "🤲", "I found something", "Help it get back to its owner")}
        </div>
      )}
    </div>
  );
}
