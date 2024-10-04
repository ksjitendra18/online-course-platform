"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import PasswordSchema from "@/validations/password";

const SetNewPassword = ({ id }: { id: string }) => {
  const [verificationErr, setVerificationErr] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationIssue, setValidationIssue] = useState<z.ZodFormattedError<
    z.infer<typeof PasswordSchema>,
    string
  > | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setVerificationErr("");
    setLoading(true);
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const newPassword = formData.get("password") as string;
      const confirmNewPassword = formData.get("confirmPassword") as string;

      if (newPassword !== confirmNewPassword) {
        setVerificationErr("Password do not match");
        return;
      }

      if (!id) {
        setVerificationErr("Pass a valid ID");
      }

      const parsedPassword = PasswordSchema.safeParse(newPassword);

      if (!parsedPassword.success) {
        setValidationIssue(parsedPassword.error.format());
        return;
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          id,
          password: newPassword,
        }),
      });

      const resData = await res.json();

      if (res.status !== 200) {
        setVerificationErr(resData.error.message);
        return;
      }

      if (res.status === 200) {
        setVerificationSuccess(true);

        setTimeout(() => {
          window.location.replace("/login");
        }, 1000);
      }
    } catch (error) {
      setVerificationErr("Unable to reset password. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto mt-32 flex max-w-[400px] flex-col items-center justify-center">
        <h1 className="text-center text-3xl font-bold">Set New Password</h1>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex w-full flex-col gap-3"
        >
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Enter New Password"
              required
              className={`${
                validationIssue?._errors ? "border-red-600" : "border-slate-600"
              } w-full rounded-md border-2 px-3 py-2`}
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              type="button"
              tabIndex={-1}
              aria-label="Password Invisible."
            >
              {showPassword ? (
                <LuEye className="absolute right-2 top-2 h-6 w-6 cursor-pointer select-none text-gray-700" />
              ) : (
                <LuEyeOff className="absolute right-2 top-2 h-6 w-6 cursor-pointer select-none text-gray-700" />
              )}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirm New Password"
              required
              className={`${
                validationIssue?._errors ? "border-red-600" : "border-slate-600"
              } w-full rounded-md border-2 px-3 py-2`}
            />
            <button
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              type="button"
              tabIndex={-1}
              aria-label="Password Invisible."
            >
              {showConfirmPassword ? (
                <LuEye className="absolute right-2 top-2 h-6 w-6 cursor-pointer select-none text-gray-700" />
              ) : (
                <LuEyeOff className="absolute right-2 top-2 h-6 w-6 cursor-pointer select-none text-gray-700" />
              )}
            </button>
          </div>

          {validationIssue?._errors}
          <div className="flex flex-col">
            {validationIssue?._errors?.map((err, idx) => (
              <p
                key={idx}
                className="my-5 rounded-md bg-red-500 px-3 py-2 text-white"
              >
                {err}
              </p>
            ))}
          </div>

          <Button variant="app">
            {loading ? (
              <>
                <Loader2 className="mx-auto animate-spin" />
              </>
            ) : (
              <>Reset Password</>
            )}
          </Button>
        </form>

        {verificationErr && (
          <div className="my-3 rounded-md bg-red-500 px-3 py-2 text-white">
            {verificationErr}
          </div>
        )}

        {verificationSuccess && (
          <div className="my-3 rounded-md bg-green-600 px-3 py-2 text-white">
            <p>
              Password Reset Success. Now you can{" "}
              <Link href="/login">Log in. Redirecting to login page...</Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SetNewPassword;
