"use client";

import { FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const ForgotPasswordForm = () => {
  const [verificationErr, setVerificationErr] = useState("");
  const [verificationMsg, setVerificationMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setVerificationErr("");
    setVerificationMsg("");
    setLoading(true);
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;

      const res = await fetch("/api/auth/password-reset-mail", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      const resData = await res.json();

      if (res.status === 200) {
        setVerificationMsg(resData.data.message);
      } else {
        setVerificationErr(resData.error.message);
        return;
      }
    } catch (error) {
      setVerificationErr("Unable to verify. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto mt-32 flex max-w-[400px] flex-col items-center justify-center">
        <h1 className="text-center text-3xl font-bold">Reset Password</h1>
        <p>Get the email for resetting password</p>
        <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full">
          <input
            placeholder="Enter email"
            type="email"
            name="email"
            id="email"
            className="w-full rounded-md border-2 border-slate-600 px-3 py-2"
            required
          />

          <Button disabled={loading} variant="app" className="my-5 w-full">
            {loading ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              <>Send Mail</>
            )}
          </Button>
        </form>

        {verificationErr && (
          <div className="my-3 rounded-md bg-red-500 px-3 py-2 text-white">
            {verificationErr}
          </div>
        )}

        {verificationMsg && (
          <div className="my-3 rounded-md bg-green-600 px-3 py-2 text-white">
            <p>{verificationMsg}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ForgotPasswordForm;
