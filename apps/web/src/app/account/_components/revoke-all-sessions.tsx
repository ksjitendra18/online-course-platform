"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

const RevokeAllSessions = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/revoke/all", {
        method: "POST",
      });

      if (res.status === 200) {
        router.refresh();
        toast.success("Revoked Access");
      }
    } catch (error) {
      toast.error("Error while revoking access");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button disabled={isLoading} onClick={handleClick} variant="destructive">
      {isLoading ? (
        <Loader2 className="mx-auto animate-spin" />
      ) : (
        "Revoke All Sessions"
      )}
    </Button>
  );
};

export default RevokeAllSessions;
