"use client";

import { FormEventHandler, useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const VerifyRecoveryCodeForm = () => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const enteredCode = formData.get("enteredCode");
    try {
      setLoading(true);
      setSuccess(false);
      setMsg("");

      const res = await fetch("/api/auth/recovery-codes/verify", {
        method: "POST",
        body: JSON.stringify({ enteredCode }),
      });

      const resData = await res.json();

      if (res.status !== 200) {
        setMsg(resData.message);
      } else {
        setSuccess(true);
        setMsg("Verification Success");

        setTimeout(() => {
          window.location.href = "/account";
        }, 1000);
      }
    } catch (error) {
      setMsg("Server Error. Try again later.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto mt-32 flex max-w-[400px] flex-col items-center justify-center">
      <h1 className="text-center text-3xl font-bold">
        Access Account via Recovery Code
      </h1>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full">
        <input
          placeholder="Enter recovery code"
          type="text"
          name="enteredCode"
          id="enteredCode"
          className="w-full rounded-md border-2 border-slate-600 px-3 py-2"
          required
        />

        <Button
          disabled={loading}
          className="my-4 flex w-full items-center justify-center gap-1 rounded-md bg-black px-5 py-3 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mx-auto animate-spin" />
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </form>

      <div className="flex w-full items-center justify-center">
        {msg && (
          <p
            className={`${
              success ? "bg-green-600" : "bg-red-600"
            } my-5 w-fit rounded-md px-2 py-2 text-white`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyRecoveryCodeForm;
