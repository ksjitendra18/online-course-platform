"use client";

import LoginSchema from "@/validations/login";
import { FormEvent, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LuEye, LuEyeOff } from "react-icons/lu";

interface Props {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginForm = ({ loading, setLoading }: Props) => {
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [validationIssue, setValidationIssue] = useState<z.ZodFormattedError<
    z.infer<typeof LoginSchema>,
    string
  > | null>(null);

  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setValidationIssue(null);
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const safeParsedData = LoginSchema.safeParse({ name, email, password });

      if (!safeParsedData.success) {
        setValidationIssue(safeParsedData.error.format());
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(safeParsedData.data),
      });

      if (res.status === 500) {
        setError("Internal Server Error. Try again later");
        return;
      }
      const resData = await res.json();

      if (res.status === 302) {
        router.push(resData.redirect);
        return;
      }
      if (res.status !== 200) {
        if (resData.error.code === "email_unverified") {
          setUnverifiedEmail(true);
          return;
        }
        setError(resData.error.message);
      }

      if (res.status === 200) {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (error) {
      setError("Error while login. Please try again later");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="flex w-full items-center justify-between">
        <form onSubmit={handleLogin} method="post" className="w-full ">
          <label
            htmlFor="email"
            className={cn(
              error || validationIssue?.email
                ? "text-red-600"
                : "text-gray-600",
              "mt-5 block"
            )}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className={cn(
              error || validationIssue?.email
                ? "border-red-600"
                : "border-slate-600",
              "px-3 w-full  py-2 rounded-md border-2"
            )}
          />

          {validationIssue?.email && (
            <div className="flex flex-col gap-3">
              {validationIssue?.email?._errors?.map((err, idx) => (
                <p
                  key={idx}
                  className="my-5 bg-red-500  text-white rounded-md px-3 py-2"
                >
                  {err}
                </p>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 mb-1">
            <label
              htmlFor="password"
              className={cn(
                error || validationIssue?.password
                  ? "text-red-600"
                  : "text-gray-600",
                " block"
              )}
            >
              Password
            </label>

            <Link href="/forgot-password">Forgot Password?</Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              required
              className={cn(
                error || validationIssue?.password
                  ? "border-red-600"
                  : "border-slate-600",
                "px-3 w-full  py-2 rounded-md border-2"
              )}
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              type="button"
              aria-label="Password Invisible."
            >
              {showPassword ? (
                <LuEye className="w-6 h-6 absolute top-2 right-2 select-none text-gray-700 cursor-pointer" />
              ) : (
                <LuEyeOff className="w-6 h-6 absolute top-2 right-2 select-none text-gray-700 cursor-pointer" />
              )}
            </button>
          </div>
          {validationIssue?.password && (
            <div className="flex flex-col ">
              {validationIssue?.password?._errors?.map((err, idx) => (
                <p
                  key={idx}
                  className="mt-2 bg-red-500 text-white rounded-md px-3 py-2"
                >
                  {err}
                </p>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-2 bg-red-500 text-white rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {unverifiedEmail && (
            <p className="mt-2 bg-red-500 text-white rounded-md px-3 py-2">
              Please verify your email. <Link href="/verify">Verify Email</Link>
            </p>
          )}
          <div className="flex justify-end">
            <Button
              variant="app"
              disabled={loading}
              type="submit"
              className="my-5 w-full"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                <>Log in</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginForm;
