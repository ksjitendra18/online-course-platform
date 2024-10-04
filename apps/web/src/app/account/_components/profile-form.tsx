"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { Check, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useDebounce } from "use-debounce";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileSchema } from "@/validations/profile";
import { UsernameSchema } from "@/validations/username";

interface Props {
  email: string;
  name: string;
  userName: string;
}
const ProfileForm = ({ email, name, userName }: Props) => {
  const [loading, setLoading] = useState(false);

  const [validationIssue, setValidationIssue] = useState<z.ZodFormattedError<
    z.infer<typeof ProfileSchema>,
    string
  > | null>(null);

  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (checkingUsername) {
        toast.error("Please wait while username availibility is being checked");
      }

      const formData = new FormData(e.currentTarget);

      const fullName = formData.get("fullName");
      const userName = formData.get("userName");

      const safeParsedData = ProfileSchema.safeParse({
        fullName,
        userName,
      });

      if (!safeParsedData.success) {
        setValidationIssue(safeParsedData.error.format());
        return;
      }

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        body: JSON.stringify(safeParsedData.data),
      });

      if (res.status === 500) {
        setError("Internal Server Error. Try again later");
        return;
      }
      const resData = await res.json();

      if (res.status !== 200) {
        setError(resData.error.message);
      }

      if (res.status === 200) {
        router.replace("/profile");
        router.refresh();
      }
    } catch (error) {
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
    if (userName === e.target.value) {
      setUsernameState((prev) => ({
        ...prev,
        isChecked: false,
        isLoading: false,
      }));
      return;
    }
    setNewUserName(e.target.value);
    setCheckingUsername(true);
  };

  useEffect(() => {
    const checkUsername = async () => {
      if (debouncedUserName === "") {
        return;
      }

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
        const res = await fetch("/api/auth/username", {
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
  }, [debouncedUserName, userName]);

  return (
    <>
      <form
        id="profile-form"
        className="mx-auto w-[100%] md:w-3/4 lg:w-1/3"
        onSubmit={handleSubmit}
      >
        <label className="mt-5 block text-gray-600" htmlFor="email">
          Email
        </label>
        <input
          type="text"
          className="w-full rounded-md border-2 border-slate-400 px-2 py-3"
          name="email"
          placeholder="Email"
          value={email}
          id="email"
          readOnly
        />
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
          defaultValue={name}
          required
          className={cn(
            error || validationIssue?.fullName
              ? "border-red-600"
              : "border-slate-600",
            "w-full rounded-md border-2 px-3 py-2"
          )}
        />

        {validationIssue?.fullName && (
          <div className="flex flex-col gap-3">
            {validationIssue?.fullName?._errors?.map((err, idx) => (
              <p
                key={idx}
                className="my-5 rounded-md bg-red-500 px-3 py-2 text-white"
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
          defaultValue={userName}
          placeholder="4+ characters"
          required
          className={cn(
            error || validationIssue?.userName
              ? "border-red-600"
              : "border-slate-600",
            "w-full rounded-md border-2 px-3 py-2"
          )}
        />

        {usernameState.isLoading && (
          <div className="my-3 flex items-center gap-2">
            <Loader2 className="mr-2 animate-spin" />
            Checking username
          </div>
        )}

        {usernameState.isChecked && (
          <>
            {usernameState.isAvailable ? (
              <div className="my-3 flex items-center gap-2 rounded-md bg-green-600 px-3 py-3 text-white">
                <Check /> Username Available
              </div>
            ) : (
              <div className="my-3 flex items-center gap-2 rounded-md bg-red-600 px-3 py-3 text-white">
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
                className="my-5 rounded-md bg-red-500 px-3 py-2 text-white"
              >
                {err}
              </p>
            ))}
          </div>
        )}
        <Button
          disabled={loading}
          type="submit"
          variant="app"
          className="mt-5 flex w-full items-center justify-center rounded-md px-10 py-2 text-center text-white duration-100 ease-in"
        >
          {loading ? (
            <>
              <Loader2 className="mx-auto animate-spin" />
            </>
          ) : (
            <>Update</>
          )}
        </Button>
      </form>
    </>
  );
};

export default ProfileForm;
