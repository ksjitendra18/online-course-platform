"use client";

import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { FaTag } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const ApplyDiscount = ({ courseId }: { price: number; courseId: string }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [valid, setValid] = useState({
    isChecked: false,
    isValid: false,
  });

  const router = useRouter();
  const pathname = usePathname();

  const handleApplyDiscount = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setLoading(true);
      setValid({
        isChecked: false,
        isValid: false,
      });

      const formData = new FormData(e.currentTarget);
      const discountCode = formData.get("code");
      const res = await fetch(`/api/courses/${courseId}/discount/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: discountCode,
        }),
      });

      if (res.ok) {
        toast.success("Discount Applied");
        router.push(`${pathname}?discountCode=${discountCode}`);
        setOpen(false);
      } else {
        setValid({
          isChecked: true,
          isValid: false,
        });
        toast.error("Invalid Discount Code");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-3">
          <FaTag />
          Apply Discount
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95%] rounded-md md:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleApplyDiscount} className="grid gap-4 py-4">
          <Input name="code" placeholder="Code" type="text" required />

          {valid.isChecked && !valid.isValid && (
            <p className="my-2 rounded-md bg-red-700 px-2 py-1 text-white">
              Invalid Discount Code
            </p>
          )}
          <DialogFooter className="flex items-center gap-5">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button disabled={loading} variant="app" type="submit">
              {loading ? <Loader2 className="mx-auto animate-spin" /> : "Apply"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyDiscount;
