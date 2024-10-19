"use client";

import { ChangeEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CreateNewDiscount = () => {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"value" | "percent">(
    "value"
  );

  const [usageLimit, setUsageLimit] = useState<"limited" | "unlimited">(
    "limited"
  );

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.toUpperCase());
  };
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="code" className="text-right">
          Code
        </Label>
        <Input
          id="code"
          name="code"
          maxLength={15}
          value={code}
          placeholder="Enter code"
          onChange={handleCodeChange}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="code" className="text-right">
          Discount by:
        </Label>

        <div className="flex gap-3">
          <button
            data-selected={discountType}
            onClick={() => setDiscountType("value")}
            className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[selected=value]:bg-blue-500 data-[selected=value]:text-white"
          >
            Value
          </button>
          <button
            data-selected={discountType}
            onClick={() => setDiscountType("percent")}
            className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[selected=percent]:bg-blue-500 data-[selected=percent]:text-white"
          >
            Percent
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="value" className="text-right">
          Enter {discountType === "value" ? "new price" : "percentage"}
        </Label>
        <Input
          name="value"
          type="number"
          required
          min={1}
          max={100}
          id="value"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Usage Limit
        </Label>
        <div className="flex gap-3">
          <button
            data-usage={usageLimit}
            onClick={() => setUsageLimit("limited")}
            className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[usage=limited]:bg-blue-500 data-[usage=limited]:text-white"
          >
            Limited
          </button>
          <button
            data-usage={usageLimit}
            onClick={() => setUsageLimit("unlimited")}
            className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[usage=unlimited]:bg-blue-500 data-[usage=unlimited]:text-white"
          >
            Unlimited
          </button>
        </div>
      </div>

      {usageLimit === "limited" && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="value" className="text-right">
            Limit
          </Label>
          <Input
            name="value"
            type="number"
            placeholder="For how much time this code can be used?"
            required
            min={1}
            max={100}
            id="value"
            className="col-span-3"
          />
        </div>
      )}
    </div>
  );
};

export default CreateNewDiscount;
