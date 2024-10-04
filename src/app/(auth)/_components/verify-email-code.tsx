"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const VerifyEmailCode = ({ verificationId }: { verificationId: string }) => {
  const [verificationErr, setVerificationErr] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function isNumber(num: string | number) {
    return !isNaN(parseFloat(String(num))) && isFinite(Number(num));
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setVerificationErr("");
    setLoading(true);
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const enteredCode = formData.get("code") as string;

      if (enteredCode && enteredCode.length != 6 && !isNumber(enteredCode)) {
        setVerificationErr("Please enter a valid 6 digit code");
        return;
      }
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({
          id: verificationId,
          code: enteredCode,
        }),
      });

      const resData = await res.json();

      if (res.status !== 200) {
        setVerificationErr(resData.error.message);
        return;
      }

      if (res.status === 200 && resData.data.emailVerified) {
        setVerificationSuccess(true);

        setTimeout(() => {
          window.location.replace("/login");
        }, 1000);
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
        <h1 className="text-center text-3xl font-bold">Verify</h1>
        <p>Enter the code received on email</p>
        <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full">
          <input
            placeholder="Enter code"
            type="text"
            name="code"
            id="code"
            className="w-full rounded-md border-2 border-slate-600 px-3 py-2"
          />

          <Button className="my-5 w-full" variant="app" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mx-auto animate-spin" />{" "}
              </>
            ) : (
              <>Verify Code</>
            )}
          </Button>
        </form>

        <div>
          Didn&apos;t receive the code?
          <Link
            href="/verify"
            className="ml-1 border-b-2 border-blue-500 font-semibold"
          >
            Retry again
          </Link>
        </div>

        {verificationErr && (
          <div className="my-3 rounded-md bg-red-500 px-3 py-2 text-white">
            {verificationErr}
          </div>
        )}

        {verificationSuccess && (
          <div className="my-3 rounded-md bg-green-600 px-3 py-2 text-white">
            <p>
              Verification Success. Now you can{" "}
              <Link href="/login">Log in. Redirecting to login page...</Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default VerifyEmailCode;
