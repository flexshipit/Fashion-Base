const STORAGE_KEY = "flexshop_guest_orders";

const EMPTY = [];
let cachedRaw = null;
let cachedParsed = EMPTY;

function readGuestOrders() {
  if (typeof window === "undefined") return EMPTY;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || "[]";

    // Must return the same reference when data has not changed
    if (raw === cachedRaw) {
      return cachedParsed;
    }

    const parsed = JSON.parse(raw);
    cachedRaw = raw;
    cachedParsed = Array.isArray(parsed) ? parsed : EMPTY;
    return cachedParsed;
  } catch {
    cachedRaw = null;
    cachedParsed = EMPTY;
    return EMPTY;
  }
}

/** Save an order reference in this browser (for guests). */
export function saveGuestOrder(order) {
  if (typeof window === "undefined" || !order?.orderNumber) return;

  try {
    const existing = readGuestOrders();
    const next = [
      {
        orderNumber: order.orderNumber,
        phone: order.phone || "",
        status: order.status || "pending",
        grandTotal: order.grandTotal ?? order.pricing?.grandTotal ?? null,
        createdAt: order.createdAt || new Date().toISOString(),
      },
      ...existing.filter((item) => item.orderNumber !== order.orderNumber),
    ].slice(0, 20);

    const raw = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedParsed = next;
  } catch {
    // ignore storage errors
  }
}

/** Read saved guest order references from this browser. */
export function getGuestOrders() {
  return readGuestOrders();
}

/** Stable snapshot for useSyncExternalStore (client). */
export function getGuestOrdersSnapshot() {
  return readGuestOrders();
}

/** Stable empty snapshot for SSR. */
export function getGuestOrdersServerSnapshot() {
  return EMPTY;
}

/** Subscribe to localStorage changes for guest orders. */
export function subscribeGuestOrders(onStoreChange) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cachedRaw = null;
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function clearGuestOrders() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedParsed = EMPTY;
}
