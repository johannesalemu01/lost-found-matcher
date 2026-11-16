"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
  action?: { label: string; onClick: () => void };
}

type Show = (message: string, opts?: { tone?: Toast["tone"]; action?: Toast["action"] }) => void;

const ToastContext = createContext<Show>(() => {});
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show: Show = useCallback(
    (message, opts = {}) => {
      const id = nextId++;
      setToasts((t) => [...t.slice(-2), { id, message, tone: opts.tone ?? "success", action: opts.action }]);
      setTimeout(() => dismiss(id), opts.action ? 7000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg ${
              t.tone === "error" ? "bg-red-700 text-white" : t.tone === "info" ? "bg-stone-800 text-white" : "bg-accent-700 text-white"
            }`}
            role="status"
          >
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                className="rounded px-2 py-1 font-semibold underline-offset-2 hover:underline"
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button aria-label="Dismiss" className="opacity-70 hover:opacity-100" onClick={() => dismiss(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
