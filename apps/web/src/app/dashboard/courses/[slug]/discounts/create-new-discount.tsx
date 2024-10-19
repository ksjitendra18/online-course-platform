"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

import { Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DiscountSchema } from "@/validations/discount";

const CreateNewDiscount = ({
  price,
  courseId,
}: {
  price: number;
  courseId: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"value" | "percent">(
    "value"
  );

  const [newPrice, setNewPrice] = useState(price);

  const [usageLimit, setUsageLimit] = useState<"limited" | "unlimited">(
    "limited"
  );

  const [timeLimit, setTimeLimit] = useState<"limited" | "unlimited">(
    "unlimited"
  );

  const [activeFrom, setActiveFrom] = useState<"now" | "other">("now");

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.toUpperCase());
  };

  const router = useRouter();
  const handleCreateNewCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);

      const timeLimitData = formData.get("timeLimitValue");
      let timeLimitValue = null;
      if (timeLimitData instanceof Date) {
        timeLimitValue = timeLimitData.getTime();
      }
      const parsedData = DiscountSchema.safeParse({
        code: formData.get("code"),
        discountType: discountType,
        originalPrice: price,
        discountValue: Number(formData.get("discountValue")),
        usageLimit: usageLimit,
        usageLimitValue: formData.get("usageLimitValue")
          ? Number(formData.get("usageLimitValue"))
          : null,
        activeFromValue: new Date(
          String(formData.get("activeFromValue") ?? new Date())
        ).getTime(),
        timeLimit: timeLimit,
        timeLimitValue: timeLimitValue,
      });

      if (!parsedData.success) {
        toast.error("One or more errors in form");
        console.log("parsed data", parsedData.error);
        return;
      }
      console.log("parsed", parsedData);

      const res = await fetch(`/api/courses/${courseId}/discount`, {
        method: "POST",
        body: JSON.stringify(parsedData.data),
      });

      const resData = await res.json();

      console.log("res", res.status, resData);

      if (res.status === 201) {
        router.refresh();
        toast.success("Discount created successfully");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Error while creating new discount");
    } finally {
      setLoading(false);
    }
  };
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="app">
          <span>
            <Plus className="mr-2" />
          </span>
          New Discount
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95%] rounded-md md:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add new Discount code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateNewCode} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              name="code"
              minLength={1}
              maxLength={15}
              value={code}
              required
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
                type="button"
                onClick={() => setDiscountType("value")}
                className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[selected=value]:bg-blue-500 data-[selected=value]:text-white"
              >
                Value
              </button>
              <button
                type="button"
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
            {discountType === "value" ? (
              <Input
                name="discountValue"
                type="number"
                id="value"
                onChange={(e) => setNewPrice(Number(e.target.value))}
                min={1}
                max={price - 1}
                required
                className="col-span-3"
              />
            ) : (
              <Input
                name="discountValue"
                type="number"
                onChange={(e) => {
                  setNewPrice(
                    Math.floor(price * (1 - Number(e.target.value) / 100))
                  );
                }}
                required
                min={1}
                max={100}
                id="value"
                className="col-span-3"
              />
            )}
          </div>
          {newPrice !== price && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                New Price
              </Label>
              <div className="flex items-center gap-3 text-xl">
                <span className="">{newPrice}</span>
                <span className="text-gray-600 line-through">{price}</span>
                {discountType === "value" && (
                  <span>{Math.floor(((price - newPrice) / price) * 100)}%</span>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Usage Limit</Label>
            <div className="flex gap-3">
              <button
                type="button"
                data-usage={usageLimit}
                onClick={() => setUsageLimit("limited")}
                className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[usage=limited]:bg-blue-500 data-[usage=limited]:text-white"
              >
                Limited
              </button>
              <button
                type="button"
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
                name="usageLimitValue"
                id="value"
                type="number"
                placeholder="How many people can use this code?"
                min={1}
                max={100}
                required
                className="col-span-3"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Active From</Label>
            <div className="flex gap-3">
              <button
                type="button"
                data-active-from={activeFrom}
                onClick={() => setActiveFrom("now")}
                className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[active-from=now]:bg-blue-500 data-[active-from=now]:text-white"
              >
                Now
              </button>
              <button
                type="button"
                data-active-from={activeFrom}
                onClick={() => setActiveFrom("other")}
                className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[active-from=other]:bg-blue-500 data-[active-from=other]:text-white"
              >
                Other
              </button>
            </div>
          </div>
          {activeFrom === "other" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activeFromValue" className="text-right">
                Limit
              </Label>
              <Input
                name="activeFromValue"
                id="activeFromValue"
                type="date"
                className="col-span-3"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Time Limit</Label>
            <div className="flex gap-3">
              <button
                type="button"
                data-time={timeLimit}
                onClick={() => setTimeLimit("unlimited")}
                className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[time=unlimited]:bg-blue-500 data-[time=unlimited]:text-white"
              >
                Unlimited
              </button>
              <button
                type="button"
                data-time={timeLimit}
                onClick={() => setTimeLimit("limited")}
                className="rounded-md bg-gray-300 px-3 py-1 text-sm data-[time=limited]:bg-blue-500 data-[time=limited]:text-white"
              >
                Limited
              </button>
            </div>
          </div>

          {timeLimit === "limited" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeLimitValue" className="text-right">
                Limit
              </Label>
              <Input
                name="timeLimitValue"
                id="timeLimitValue"
                type="date"
                placeholder="For how much time this code can be used?"
                className="col-span-3"
              />
            </div>
          )}
          <DialogFooter>
            <Button disabled={loading} variant="app" type="submit">
              {loading ? (
                <Loader2 className="mx-auto animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDiscount;
