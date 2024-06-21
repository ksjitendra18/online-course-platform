"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { ImSpinner8 } from "react-icons/im";

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
        setVerificationErr(resData.message);
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
      <div className="flex max-w-[400px] mt-32 mx-auto items-center justify-center flex-col">
        <h1 className="text-3xl font-bold text-center">Reset Password</h1>
        <p>Get the email for resetting password</p>
        <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full">
          <input
            placeholder="Enter email"
            type="email"
            name="email"
            id="email"
            className="border-2 border-slate-600 px-3 py-2 w-full rounded-md"
            required
          />

          <Button disabled={loading} variant="app" className="w-full my-5">
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <>Send Mail</>
            )}
          </Button>
        </form>

        {verificationErr && (
          <div className="bg-red-500 text-white px-3 py-2 rounded-md my-3">
            {verificationErr}
          </div>
        )}

        {verificationMsg && (
          <div className="bg-green-600 text-white px-3 py-2 rounded-md my-3">
            <p>{verificationMsg}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ForgotPasswordForm;
