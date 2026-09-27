const TOAST_EVENT = "app:toast";
const DISMISS_EVENT = "app:toast-dismiss";
const DEFAULT_DURATION = 4200;

let idCounter = 0;

function emit(type, message, options = {}) {
  if (typeof window === "undefined" || !message) return null;

  const id = ++idCounter;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id,
        type,
        message: String(message),
        duration: options.duration ?? DEFAULT_DURATION,
      },
    }),
  );
  return id;
}

export const toast = {
  success(message, options) {
    return emit("success", message, options);
  },
  error(message, options) {
    return emit("error", message, options);
  },
  warning(message, options) {
    return emit("warning", message, options);
  },
  info(message, options) {
    return emit("info", message, options);
  },
  message(message, options) {
    return emit("default", message, options);
  },
  dismiss(id) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent(DISMISS_EVENT, { detail: { id } }),
    );
  },
};

export const TOAST_EVENTS = {
  show: TOAST_EVENT,
  dismiss: DISMISS_EVENT,
};
