"use client";

import { z } from "zod";
import LoginSchema from "@/validations/login";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { LuEye, LuEyeOff } from "react-icons/lu";
import { ImSpinner2, ImSpinner8 } from "react-icons/im";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StudentSignupSchema } from "@/validations/student-signup";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { UsernameSchema } from "@/validations/username";
import { useDebounce } from "use-debounce";

interface Props {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const StudentSignupForm = ({ loading, setLoading }: Props) => {
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [validationIssue, setValidationIssue] = useState<z.ZodFormattedError<
    z.infer<typeof StudentSignupSchema>,
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

    const fullName = formData.get("fullName");
    const userName = formData.get("userName");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const safeParsedData = StudentSignupSchema.safeParse({
        fullName,
        userName,
        email,
        password,
      });

      if (!safeParsedData.success) {
        setValidationIssue(safeParsedData.error.format());
        return;
      }

      const res = await fetch("/api/auth/signup/student", {
        method: "POST",
        body: JSON.stringify(safeParsedData.data),
      });

      if (res.status === 500) {
        setError("Internal Server Error. Try again later");
        return;
      }
      const resData = await res.json();

      if (res.status === 201) {
        router.replace(`/verify/${resData.data.id}`);
      } else {
        if (resData.error.code === "email_unverified") {
          setUnverifiedEmail(true);
        }
        setError(resData.error.message);
      }
    } catch (error) {
      setError("Error while Signup. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  const [checkingUsername, setCheckingUsername] = useState(false);

  const [usernameState, setUsernameState] = useState({
    isChecked: false,
    isLoading: false,
    isAvailable: false,
    isError: false,
  });
  const [newUserName, setNewUserName] = useState("");

  const [debouncedUserName] = useDebounce(newUserName, 500);

  const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewUserName(e.target.value);
    setCheckingUsername(true);
  };

  useEffect(() => {
    const checkUsername = async () => {
      if (debouncedUserName === "") {
        return;
      }

      setError("");

      setUsernameState({
        isChecked: false,
        isAvailable: false,
        isError: false,
        isLoading: true,
      });
      try {
        const parsedData = UsernameSchema.safeParse(debouncedUserName);
        if (!parsedData.success) {
          toast.error("Please enter a valid username");
          setError(parsedData.error.format()._errors[0]);
        }
        const res = await fetch("/api/auth/availability/username", {
          method: "POST",
          body: JSON.stringify({ userName: debouncedUserName }),
        });

        if (res.status === 400) {
          setUsernameState(() => ({
            isLoading: false,
            isAvailable: false,
            isChecked: true,
            isError: false,
          }));
        } else if (res.status === 200) {
          setUsernameState(() => ({
            isLoading: false,
            isAvailable: true,
            isChecked: true,
            isError: false,
          }));
        } else {
          setUsernameState(() => ({
            isLoading: false,
            isAvailable: false,
            isChecked: true,
            isError: true,
          }));

          toast.error("Error while checking username");
          setError("Server Error");
        }
      } catch (error) {
        toast.error("Error while checking username");
        setError("Server Error");
      } finally {
        setCheckingUsername(false);
      }
    };
    checkUsername();
  }, [debouncedUserName]);
  return (
    <>
      <div className="flex w-full  items-center justify-between">
        <form
          onSubmit={handleLogin}
          method="post"
          className="w-[100%] mx-auto md:w-3/4 lg:w-1/3 "
        >
          <label
            htmlFor="fullName"
            className={cn(
              error || validationIssue?.fullName
                ? "text-red-600"
                : "text-gray-600",
              "mt-5 block"
            )}
          >
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            required
            className={cn(
              error || validationIssue?.fullName
                ? "border-red-600"
                : "border-slate-600",
              "px-3 w-full  py-2 rounded-md border-2"
            )}
          />

          {validationIssue?.fullName && (
            <div className="flex flex-col gap-3">
              {validationIssue?.fullName?._errors?.map((err, idx) => (
                <p
                  key={idx}
                  className="my-5 bg-red-500  text-white rounded-md px-3 py-2"
                >
                  {err}
                </p>
              ))}
            </div>
          )}
          <label
            htmlFor="userName"
            className={cn(
              error || validationIssue?.userName
                ? "text-red-600"
                : "text-gray-600",
              "mt-5 block"
            )}
          >
            User Name
          </label>
          <input
            type="text"
            name="userName"
            id="userName"
            onChange={handleUserNameChange}
            placeholder="4+ characters"
            required
            className={cn(
              error || validationIssue?.userName
                ? "border-red-600"
                : "border-slate-600",
              "px-3 w-full  py-2 rounded-md border-2"
            )}
          />

          {usernameState.isLoading && (
            <div className="flex my-3 items-center gap-2">
              <Loader2 className="mr-2 animate-spin" />
              Checking username
            </div>
          )}

          {usernameState.isChecked && (
            <>
              {usernameState.isAvailable ? (
                <div className="flex my-3 rounded-md px-3 py-3 bg-green-600 text-white items-center gap-2">
                  <Check /> Username Available
                </div>
              ) : (
                <div className="flex my-3 rounded-md px-3 py-3 bg-red-600 text-white items-center gap-2">
                  <X /> Username Not Available
                </div>
              )}
            </>
          )}

          {validationIssue?.userName && (
            <div className="flex flex-col gap-3">
              {validationIssue?.userName?._errors?.map((err, idx) => (
                <p
                  key={idx}
                  className="my-5 bg-red-500  text-white rounded-md px-3 py-2"
                >
                  {err}
                </p>
              ))}
            </div>
          )}
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
            autoComplete="username"
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
            <Button
              variant="app"
              disabled={loading}
              type="submit"
              className="my-5 w-full"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                <>Signup</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default StudentSignupForm;
