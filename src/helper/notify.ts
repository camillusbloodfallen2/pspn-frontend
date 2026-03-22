export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

type Listener = (toast: ToastItem) => void;

const listeners = new Set<Listener>();
let nextToastId = 1;

const emit = (tone: ToastTone, title: string, description?: string) => {
  const toast: ToastItem = {
    id: nextToastId++,
    tone,
    title,
    description,
  };

  listeners.forEach((listener) => listener(toast));
};

export const notify = {
  success: (title: string, description?: string) =>
    emit("success", title, description),
  error: (title: string, description?: string) =>
    emit("error", title, description),
  info: (title: string, description?: string) =>
    emit("info", title, description),
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
