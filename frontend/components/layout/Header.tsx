"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { cx } from "@/utils/cx";
import { RoleToggle } from "./RoleToggle";

const NAV = [
  { href: "/reports", label: "Browse" },
  { href: "/my-reports", label: "My reports" },
];

export function Header() {
  const pathname = usePathname();
  const { role } = useRole();
  const links = role === "staff" ? [...NAV, { href: "/staff/matches", label: "Staff review" }] : NAV;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
            <rect width="32" height="32" rx="7" className="fill-accent-600" />
            <circle cx="14" cy="14" r="6" fill="none" stroke="#fff" strokeWidth="2.5" />
            <path d="M18.5 18.5 24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Lost &amp; Found
        </Link>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cx(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm",
                pathname.startsWith(l.href) ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:text-stone-900",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <RoleToggle />
      </div>
    </header>
  );
}
