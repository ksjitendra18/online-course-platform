"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FormEventHandler, useState } from "react";

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
    <div className="flex max-w-[400px] mt-32 mx-auto items-center justify-center flex-col">
      <h1 className="text-3xl font-bold text-center">
        Access Account via Recovery Code
      </h1>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full">
        <input
          placeholder="Enter recovery code"
          type="text"
          name="enteredCode"
          id="enteredCode"
          className="border-2 border-slate-600 px-3 py-2 w-full rounded-md"
          required
        />

        <Button
          disabled={loading}
          className="rounded-md my-4 flex items-center justify-center gap-1 bg-black px-5 py-3 w-full text-white"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mx-auto" />
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </form>

      <div className="flex items-center justify-center w-full">
        {msg && (
          <p
            className={`${
              success ? "bg-green-600" : "bg-red-600"
            } my-5 rounded-md w-fit px-2 py-2 text-white`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyRecoveryCodeForm;
