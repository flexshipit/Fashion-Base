import crypto from "crypto";

export const PAYMENT_METHODS = ["cod", "bkash", "nagad"];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();

  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `ORD-${timestamp}-${random}`;
}

export function validatePhone(phone) {
  if (typeof phone !== "string") {
    return false;
  }

  const cleaned = phone.replace(/\s+/g, "");

  return /^01[3-9]\d{8}$/.test(cleaned);
}

export function validatePayment({ paymentMethod, transactionId }) {
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return {
      valid: false,
      message: "Invalid payment method",
    };
  }

  const cleanTransactionId =
    typeof transactionId === "string" ? transactionId.trim() : "";

  if (paymentMethod === "cod" && cleanTransactionId) {
    return {
      valid: false,
      message: "Transaction ID is not required for Cash on Delivery",
    };
  }

  if (paymentMethod !== "cod" && !cleanTransactionId) {
    return {
      valid: false,
      message: "Transaction ID is required for online payment",
    };
  }

  return {
    valid: true,
    transactionId: paymentMethod === "cod" ? "" : cleanTransactionId,
  };
}
