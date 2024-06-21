"use client";

import { Button } from "@/components/ui/button";
import PasswordSchema from "@/validations/password";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ImSpinner8 } from "react-icons/im";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { z } from "zod";

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
        setVerificationErr(resData.message);
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
      <div className="flex max-w-[400px] mt-32 mx-auto items-center justify-center flex-col">
        <h1 className="text-3xl font-bold text-center">Set New Password</h1>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex flex-col gap-3 mt-8 w-full"
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
              }  px-3 w-full  py-2 rounded-md border-2`}
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              type="button"
              tabIndex={-1}
              aria-label="Password Invisible."
            >
              {showPassword ? (
                <LuEye className="w-6 h-6 absolute top-2 right-2 select-none text-gray-700 cursor-pointer" />
              ) : (
                <LuEyeOff className="w-6 h-6 absolute top-2 right-2 select-none text-gray-700 cursor-pointer" />
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
              }  px-3 w-full  py-2 rounded-md border-2`}
            />
            <button
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              type="button"
              tabIndex={-1}
              aria-label="Password Invisible."
            >
              {showConfirmPassword ? (
                <LuEye className="w-6 h-6 absolute top-2 right-2 select-none text-gray-700 cursor-pointer" />
              ) : (
                <LuEyeOff className="w-6 h-6 absolute top-2 right-2 select-none text-gray-700 cursor-pointer" />
              )}
            </button>
          </div>

          {validationIssue?._errors}
          <div className="flex flex-col">
            {validationIssue?._errors?.map((err, idx) => (
              <p
                key={idx}
                className="my-5 bg-red-500  text-white rounded-md px-3 py-2"
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
          <div className="bg-red-500 text-white px-3 py-2 rounded-md my-3">
            {verificationErr}
          </div>
        )}

        {verificationSuccess && (
          <div className="bg-green-600 text-white px-3 py-2 rounded-md my-3">
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
