"use client";

import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

export default function DeliveryForm({ value, onChange }) {
  const update = (field) => (event) =>
    onChange?.({ ...value, [field]: event.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label="Full name"
          value={value.name || ""}
          onChange={update("name")}
          required
        />
      </div>
      <Input
        label="Phone"
        placeholder="01XXXXXXXXX"
        value={value.phone || ""}
        onChange={update("phone")}
        required
      />
      <Input
        label="District"
        placeholder="Dhaka"
        value={value.district || value.city || ""}
        onChange={update("district")}
        required
      />
      <div className="sm:col-span-2">
        <Input
          label="Thana / Area"
          value={value.thana || ""}
          onChange={update("thana")}
        />
      </div>
      <div className="sm:col-span-2">
        <Textarea
          label="Full address"
          rows={5}
          value={value.address || ""}
          onChange={update("address")}
          placeholder="House, road, landmark..."
          required
        />
      </div>
    </div>
  );
}
