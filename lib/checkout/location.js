export const FIXED_DELIVERY_CHARGE = 120;

export function normalizeDistrict(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const normalized = value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const dhakaValues = ["dhaka", "ঢাকা", "dhaka district", "ঢাকা জেলা"];

  if (dhakaValues.includes(normalized)) {
    return "Dhaka";
  }

  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

/** Flat nationwide delivery charge (BDT). District is ignored. */
export function getDeliveryCharge() {
  return FIXED_DELIVERY_CHARGE;
}
