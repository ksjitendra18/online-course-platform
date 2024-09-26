"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EmailSchema from "@/validations/email";

const MagicLinkForm = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSucess] = useState(false);
  const router = useRouter();
  const handleMagicLinkLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email");

      const validEmail = EmailSchema.safeParse(email);

      if (!validEmail.success) {
        setError("Invalid email");
        toast.error("Invalid email");
        return;
      }
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        body: JSON.stringify({ email: email }),
      });

      const resData = await res.json();

      if (res.status === 200) {
        setSucess(true);
      } else {
        setError(resData.error.message);
        toast.error(resData.error.message);
      }
    } catch (error) {
      setError("Error while login. Please try again later");
      toast.error("Error while login. Please try again later");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mb-7 w-full">
      <form method="post" onSubmit={handleMagicLinkLogin} className="space-y-4">
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          required
          className={cn(
            error ? "border-red-600" : "border-slate-600",
            "mt-4 w-full rounded-md border-2 px-3 py-2"
          )}
        />

        {error ? (
          <>
            <p className="rounded-md bg-red-600 px-2 py-1 text-white">
              {error}
            </p>
          </>
        ) : null}
        <Button variant="app" className="w-full" type="submit">
          {loading ? (
            <Loader2 className="mx-auto animate-spin" />
          ) : (
            "Send Magic Link"
          )}
        </Button>
      </form>
      {success && (
        <p className="rounded-md bg-green-700 px-2 py-1 text-white">
          Magic Link Sent
        </p>
      )}
    </div>
  );
};

export default MagicLinkForm;
