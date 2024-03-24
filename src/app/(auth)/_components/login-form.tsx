"use client";

import { z } from "zod";
import LoginSchema from "@/validations/login";
import { FormEvent, useState } from "react";

import { LuEye, LuEyeOff } from "react-icons/lu";
import { ImSpinner2, ImSpinner8 } from "react-icons/im";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { revalidatePath } from "next/cache";

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

  // const [loading, setLoading] = useState(false);
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

      if (res.status !== 200) {
        if (resData.error === "email_unverified") {
          setUnverifiedEmail(true);
        }
        setError(resData.message);
      }

      if (res.status === 200) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Error while Signup. Please try again later");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="flex w-full items-center justify-between">
        <form
          onSubmit={handleLogin}
          method="post"
          className="w-[100%] mx-auto md:w-3/4 lg:w-1/3 "
        >
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
          <div className="flex justify-end">
            <button
              disabled={loading}
              type="submit"
              className={cn(
                loading
                  ? "scale-95  bg-blue-500"
                  : "bg-blue-600 hover:scale-95",
                " mt-5 flex items-center justify-center w-full px-10 py-2 text-center rounded-md text-white  duration-100 ease-in"
              )}
            >
              {loading ? (
                <>
                  <ImSpinner8 className="animate-spin  mr-2 " /> Log in
                </>
              ) : (
                <>Log in</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginForm;
