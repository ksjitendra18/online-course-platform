"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";

import debounce from "lodash.debounce";
import { Check, Loader2 } from "lucide-react";
import { ImSpinner8 } from "react-icons/im";
import { LuEye, LuEyeOff } from "react-icons/lu";
import slugify from "slugify";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { OrganizationSetupSchema } from "@/validations/organization-setup";
import { OrganizationSignupSchema } from "@/validations/organization-signup";

interface Props {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const OrganizationSetup = () => {
  const [orgName, setOrgName] = useState("");
  // const [orgSlug, setOrgSlug] = useState("");
  const [orgSlug, setOrgSlug] = useState(slugify(orgName, { lower: true }));
  const [validationIssue, setValidationIssue] = useState<z.ZodFormattedError<
    z.infer<typeof OrganizationSignupSchema>,
    string
  > | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setValidationIssue(null);
    setError("");

    const formData = new FormData(e.currentTarget);

    const orgName = formData.get("orgName");
    const orgSlug = formData.get("orgSlug");

    try {
      const safeParsedData = OrganizationSetupSchema.safeParse({
        orgName,
        orgSlug,
      });

      if (!safeParsedData.success) {
        setValidationIssue(safeParsedData.error.format());
        return;
      }

      const res = await fetch("/api/organization", {
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

      if (res.status === 201) {
        // window.location.replace("/dashboard");
        router.replace("/dashboard");
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
          onSubmit={handleSignup}
          method="post"
          className="mx-auto w-[100%] md:w-3/4 lg:w-1/3"
        >
          <label
            htmlFor="orgName"
            className={cn(
              error || validationIssue?.orgName
                ? "text-red-600"
                : "text-gray-600",
              "mt-5 block"
            )}
          >
            Organization Name
          </label>
          <input
            type="text"
            name="orgName"
            id="orgName"
            onChange={(e) => {
              setOrgName(e.target.value);
            }}
            required
            className={cn(
              error || validationIssue?.orgName
                ? "border-red-600"
                : "border-slate-600",
              "w-full rounded-md border-2 px-3 py-2"
            )}
          />

          {validationIssue?.orgName && (
            <div className="flex flex-col gap-3">
              {validationIssue?.orgName?._errors?.map((err, idx) => (
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
            htmlFor="orgSlug"
            className={cn(
              error || validationIssue?.orgSlug
                ? "text-red-600"
                : "text-gray-600",
              "mt-5 block"
            )}
          >
            Organization Slug
          </label>
          <input
            type="text"
            name="orgSlug"
            id="orgSlug"
            defaultValue={slugify(orgName, { lower: true })}
            required
            className={cn(
              error || validationIssue?.orgSlug
                ? "border-red-600"
                : "border-slate-600",
              "w-full rounded-md border-2 px-3 py-2"
            )}
          />

          {validationIssue?.orgSlug && (
            <div className="flex flex-col gap-3">
              {validationIssue?.orgSlug?._errors?.map((err, idx) => (
                <p
                  key={idx}
                  className="my-5 rounded-md bg-red-500 px-3 py-2 text-white"
                >
                  {err}
                </p>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-2 rounded-md bg-red-500 px-3 py-2 text-white">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <button
              disabled={loading}
              type="submit"
              className={cn(
                loading ? "scale-95 bg-blue-500" : "bg-blue-600 hover:scale-95",
                "mt-5 flex w-full items-center justify-center rounded-md px-10 py-2 text-center text-white duration-100 ease-in"
              )}
            >
              {loading ? (
                <>
                  <ImSpinner8 className="mr-2 animate-spin" />
                </>
              ) : (
                <>Create Organization</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default OrganizationSetup;
