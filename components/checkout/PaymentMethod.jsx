"use client";

import Input from "@/components/ui/Input";

const methods = [
  {
    id: "cod",
    label: "Cash on delivery",
    hint: "Pay when your order arrives.",
  },
  {
    id: "bkash",
    label: "bKash",
    number: "01572912789",
    hint: "Send money to this bKash number, then enter the Transaction ID.",
  },
  {
    id: "nagad",
    label: "Nagad",
    number: "01317136420",
    hint: "Send money to this Nagad number, then enter the Transaction ID.",
  },
];

export default function PaymentMethod({
  value,
  onChange,
  transactionId = "",
  onTransactionIdChange,
}) {
  const selected = methods.find((method) => method.id === value);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
              value === method.id
                ? "border-primary bg-primary/5"
                : "border-base-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              className="radio radio-primary mt-1"
              checked={value === method.id}
              onChange={() => onChange?.(method.id)}
            />
            <span>
              <span className="block font-medium">{method.label}</span>
              <span className="mt-0.5 block text-xs opacity-70">
                {method.hint}
              </span>
            </span>
          </label>
        ))}
      </div>

      {selected?.number ? (
        <div className="space-y-3 rounded-xl border border-base-300 bg-base-200/40 p-4">
          <div>
            <p className="text-sm font-medium">{selected.label} number</p>
            <p className="mt-1 text-lg font-semibold tracking-wide">
              {selected.number}
            </p>
            <p className="mt-1 text-xs opacity-70">
              Use Send Money, then paste the Transaction ID below.
            </p>
          </div>

          <Input
            label="Transaction ID"
            value={transactionId}
            onChange={(event) => onTransactionIdChange?.(event.target.value)}
            placeholder="Enter transaction ID"
            required
          />
        </div>
      ) : null}
    </div>
  );
}
