"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useTransition } from "react";

import { Loader2, X } from "lucide-react";

const ShowDiscountCode = ({ code }: { code: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams.toString());
  const [isPending, startTransition] = useTransition();
  const handleClick = () => {
    params.delete("discountCode");
    startTransition(() => {
      router.refresh();
      router.push(`${pathname}?${params.toString()}`);
    });
  };
  return (
    <div className="flex items-center justify-center gap-3 rounded-full bg-red-800/40 px-3 py-2 text-sm">
      {code}
      <button disabled={isPending} onClick={handleClick}>
        {isPending ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <X size={20} />
        )}
      </button>
    </div>
  );
};

export default ShowDiscountCode;
