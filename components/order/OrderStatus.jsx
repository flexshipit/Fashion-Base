const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderStatus({ status }) {
  const current = steps.indexOf(status);

  if (status === "cancelled" || status === "returned") {
    return <div className="badge badge-error badge-lg">{status}</div>;
  }

  return (
    <ul className="steps steps-vertical w-full lg:steps-horizontal">
      {steps.map((step, index) => (
        <li
          key={step}
          className={`step capitalize ${index <= current ? "step-primary" : ""}`}
        >
          {step}
        </li>
      ))}
    </ul>
  );
}
