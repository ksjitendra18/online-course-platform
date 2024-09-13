"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RotateRecoveryCode() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleClick = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/recovery-codes/rotate", {
        method: "POST",
      });

      if (res.ok) {
        toast.success(
          "Recovery Codes Rotated Successfully. Make sure to download the codes."
        );
        router.refresh();
      } else {
        toast.error("Error while rotating recovery codes");
      }
    } catch (error) {
      toast.error("Error while rotating recovery codes");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button onClick={handleClick} disabled={loading} variant="destructive">
      {loading ? (
        <Loader2 className="animate-spin mx-auto" />
      ) : (
        "Rotate Recovery Codes"
      )}
    </Button>
  );
}
