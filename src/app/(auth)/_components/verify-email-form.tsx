"use client";

import { FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";
import { ImSpinner8 } from "react-icons/im";

import { Button } from "@/components/ui/button";

const VerifyEmailForm = () => {
  const [verificationErr, setVerificationErr] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setVerificationErr("");
    setLoading(true);
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;

      const res = await fetch("/api/auth/verification-mail", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      const resData = await res.json();

      if (res.status !== 200) {
        setVerificationErr(resData.error.message);
        return;
      }

      window.location.href = `/verify/${resData.data.verificationId}`;
    } catch (error) {
      setVerificationErr("Unable to verify. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto mt-32 flex max-w-[400px] flex-col items-center justify-center">
        <h1 className="text-center text-3xl font-bold">Verify Email</h1>
        <p>Enter the email</p>
        <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full">
          <input
            placeholder="Enter email"
            type="email"
            name="email"
            id="email"
            className="w-full rounded-md border-2 border-slate-600 px-3 py-2"
            required
          />

          <Button variant="app" disabled={loading} className="my-5 w-full">
            {loading ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              <>Send Mail</>
            )}
          </Button>
        </form>

        {/* <div>Didn't receive the code? Retry again</div> */}

        {verificationErr && (
          <div className="my-3 rounded-md bg-red-500 px-3 py-2 text-white">
            {verificationErr}
          </div>
        )}

        {verificationSuccess && (
          <div className="my-3 rounded-md bg-green-600 px-3 py-2 text-white">
            <p>Verification Success. Now you can login</p>
          </div>
        )}
      </div>
    </>
  );
};

export default VerifyEmailForm;
