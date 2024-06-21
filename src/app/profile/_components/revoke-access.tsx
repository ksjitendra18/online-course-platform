"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

const RevokeAcess = ({ id }: { id: string }) => {
  const router = useRouter();
  const handleClick = async () => {
    const res = await fetch("/api/auth/revoke", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    if (res.status === 200) {
      toast.success("Revoked Access");
    }
    router.refresh();
  };
  return (
    <Button onClick={handleClick} variant="destructive">
      Revoke Acess
    </Button>
  );
};

export default RevokeAcess;
