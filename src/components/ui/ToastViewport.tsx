import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { notify, ToastItem } from "../../helper/notify";
import { CloseIcon } from "./Icons";

const toneStyles: Record<ToastItem["tone"], string> = {
  success: "app-toast-success",
  error: "app-toast-error",
  info: "app-toast-info",
};

const ToastViewport: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return notify.subscribe((toast) => {
      setToasts((current) => [...current, toast]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3600);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[140] flex w-[min(24rem,calc(100%-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() =>
            setToasts((current) =>
              current.filter((item) => item.id !== toast.id)
            )
          }
          className={clsx(
            "pointer-events-auto w-full rounded-2xl border px-4 py-3 text-left backdrop-blur-2xl transition hover:-translate-y-0.5",
            toneStyles[toast.tone]
          )}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{toast.title}</div>
              {toast.description ? (
                <div className="app-text-muted mt-1 text-sm">
                  {toast.description}
                </div>
              ) : null}
            </div>
            <CloseIcon className="mt-0.5 h-4 w-4 shrink-0 text-current/70" />
          </div>
        </button>
      ))}
    </div>
  );
};

export default ToastViewport;
