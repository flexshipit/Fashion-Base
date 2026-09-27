"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CircleAlert, Info, X, TriangleAlert } from "lucide-react";
import { TOAST_EVENTS } from "@/lib/toast/toast";
import { cn } from "@/lib/utils/cn";

const LABELS = {
  success: "Confirmed",
  error: "Something went wrong",
  warning: "Please note",
  info: "Update",
  default: "Notice",
};

const ICONS = {
  success: Check,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  default: Info,
};

const ACCENT = {
  success: "bg-success",
  error: "bg-error",
  warning: "bg-warning",
  info: "bg-info",
  default: "bg-secondary",
};

const ICON_TONE = {
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-info",
  default: "text-secondary",
};

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const onDismissRef = useRef(onDismiss);
  const Icon = ICONS[toast.type] || ICONS.default;

  onDismissRef.current = onDismiss;

  useEffect(() => {
    const enter = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(enter);
  }, []);

  function beginDismiss() {
    setLeaving(true);
    setTimeout(() => onDismissRef.current(toast.id), 280);
  }

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return undefined;

    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onDismissRef.current(toast.id), 280);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, toast.id]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm overflow-hidden border border-base-300 bg-base-100 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out",
        visible && !leaving
          ? "translate-x-0 opacity-100"
          : "translate-x-6 opacity-0",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-[2px]", ACCENT[toast.type])}
      />

      <div className="flex flex-1 items-start gap-3 px-4 py-3.5 pl-5">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-base-300 bg-base-200/70",
            ICON_TONE[toast.type],
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="section-eyebrow mb-1 text-[0.625rem]">
            {LABELS[toast.type] || LABELS.default}
          </p>
          <p className="text-sm leading-snug text-base-content/90">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={beginDismiss}
          className="btn btn-ghost btn-xs h-7 w-7 min-h-0 shrink-0 rounded-none p-0 text-base-content/40 hover:bg-transparent hover:text-base-content"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export default function Toaster({ position = "top-right" }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onShow(event) {
      const next = event.detail;
      setToasts((current) => [next, ...current].slice(0, 5));
    }

    function onDismiss(event) {
      const { id } = event.detail || {};
      if (id == null) {
        setToasts([]);
        return;
      }
      setToasts((current) => current.filter((item) => item.id !== id));
    }

    window.addEventListener(TOAST_EVENTS.show, onShow);
    window.addEventListener(TOAST_EVENTS.dismiss, onDismiss);
    return () => {
      window.removeEventListener(TOAST_EVENTS.show, onShow);
      window.removeEventListener(TOAST_EVENTS.dismiss, onDismiss);
    };
  }, []);

  function removeToast(id) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  const positionClass =
    position === "top-left"
      ? "left-4 top-4 items-start"
      : position === "bottom-right"
        ? "bottom-4 right-4 items-end"
        : position === "bottom-left"
          ? "bottom-4 left-4 items-start"
          : "right-4 top-4 items-end";

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5 sm:w-full",
        positionClass,
      )}
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} onDismiss={removeToast} />
      ))}
    </div>
  );
}
