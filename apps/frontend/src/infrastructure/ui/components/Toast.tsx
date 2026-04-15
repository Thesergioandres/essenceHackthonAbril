"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  tone?: "error" | "success";
  onClose: () => void;
}

const toneClassName: Record<NonNullable<ToastProps["tone"]>, string> = {
  error: "border-error/35 bg-error-container text-on-error-container",
  success: "border-primary/35 bg-primary/10 text-primary"
};

export const Toast = ({
  message,
  isVisible,
  tone = "error",
  onClose
}: ToastProps): JSX.Element | null => {
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 3800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-[100] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto w-full max-w-md rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_20px_44px_rgba(15,23,42,0.18)] backdrop-blur ${toneClassName[tone]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <p>{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-current/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
