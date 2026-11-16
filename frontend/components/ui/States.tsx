import type { ReactNode } from "react";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-stone-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-accent-600" />
      {label}
    </div>
  );
}

export function EmptyState({ title, children, icon = "🗂️" }: { title: string; children?: ReactNode; icon?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 px-6 py-12 text-center">
      <div className="text-3xl" aria-hidden>
        {icon}
      </div>
      <p className="mt-3 font-medium text-stone-800">{title}</p>
      {children && <div className="mt-1 text-sm text-stone-500">{children}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800" role="alert">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-md bg-white px-3 py-1.5 font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-100">
          Try again
        </button>
      )}
    </div>
  );
}
