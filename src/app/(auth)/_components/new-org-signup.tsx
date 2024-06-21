"use client";

import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { OrganizationSignupSchema } from "@/validations/organization-signup";
import debounce from "lodash.debounce";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ImSpinner8 } from "react-icons/im";
import { LuEye, LuEyeOff } from "react-icons/lu";
import slugify from "slugify";
interface Props {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const OrganizationSignupForm = ({ loading, setLoading }: Props) => {
  const [userName, setUserName] = useState("");
  const [orgSlugInfo, setOrgSlugInfo] = useState({
    isAvailable: false,
    isChecking: false,
    hasInteracted: false,
  });
  const [userNameInfo, setUserNameInfo] = useState({
    isAvailable: false,
    isChecking: false,
    hasInteracted: false,
  });
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  // const [orgSlug, setOrgSlug] = useState(slugify(orgName, { lower: true }));
  const [validationIssue, setValidationIssue] = useState<z.ZodFormattedError<
    z.infer<typeof OrganizationSignupSchema>,
    string
  > | null>(null);

  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setValidationIssue(null);
    setLoading(true);
    setError("");
    // setOrgName("");
    // setUserName("")
    // setOrgSlug("")

    const formData = new FormData(e.currentTarget);

    const orgName = formData.get("orgName");
    const orgSlug = formData.get("orgSlug");
    const fullName = formData.get("fullName");
    const userName = formData.get("userName");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const safeParsedData = OrganizationSignupSchema.safeParse({
        orgName,
        orgSlug,
        fullName,
        userName,
        email,
        password,
      });

      if (!safeParsedData.success) {
        setValidationIssue(safeParsedData.error.format());
        return;
      }

      const res = await fetch("/api/auth/signup/organization", {
        method: "POST",
        body: JSON.stringify(safeParsedData.data),
      });

      if (res.status === 500) {
        setError("Internal Server Error. Try again later");
        return;
      }
      const resData = await res.json();

      if (res.status !== 200) {
        setError(resData.message);
      }

      if (res.status === 201) {
        // window.location.replace("/dashboard");
        router.replace("/login");
      }
    } catch (error) {
      setError("Error while Signup. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // setOrgSlug(slugify(orgName, { lower: true }));

    setOrgSlug(value);

    console.log("val is", orgSlug);

    if (value.length === 0) {
      setOrgSlugInfo((prev) => ({
        ...prev,
        isChecking: false,
        hasInteracted: false,
      }));

      return;
    }

    checkOrgSlug(value);
  };

  const checkOrgSlug = useCallback(
    debounce(async (value) => {
      setOrgSlugInfo((prev) => ({
        ...prev,
        isChecking: true,
        hasInteracted: true,
      }));

      console.log("org lsug", orgSlug);

      const res = await fetch("/api/auth/availability/org-slug", {
        method: "POST",
        body: JSON.stringify({ slug: orgSlug }),
      });

      if (res.status === 200) {
        setOrgSlugInfo((prev) => ({
          ...prev,
          isAvailable: true,
          isChecking: false,
        }));
      } else {
        setOrgSlugInfo((prev) => ({
          ...prev,
          isAvailable: false,
          isChecking: false,
        }));
      }
    }, 500),
    []
  );

  return (
    <>
      <div className="flex w-full  items-center justify-between">
        <form
          onSubmit={handleSignup}
          method="post"
          className="w-[100%] mx-auto md:w-3/4 lg:w-1/3 "
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

              console.log("setting.........................");
              setOrgSlug(slugify(e.target.value, { lower: true }));
              if (orgSlug.length !== 0) {
                checkOrgSlug(orgSlug);
              }
            }}
            required
            className={cn(
              error || validationIssue?.orgName
                ? "border-red-600"
                : "border-slate-600",
              "px-3 w-full  py-2 rounded-md border-2"
            )}
          />

          {validationIssue?.orgName && (
            <div className="flex flex-col gap-3">
              {validationIssue?.orgName?._errors?.map((err, idx) => (
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
            onChange={handleOrgSlugChange}
            defaultValue={orgSlug}
            required
            className={cn(
              error || validationIssue?.orgSlug
                ? "border-red-600"
                : "border-slate-600",
              "px-3 w-full  py-2 rounded-md border-2"
            )}
          />

          {validationIssue?.orgSlug && (
            <div className="flex flex-col gap-3">
              {validationIssue?.orgSlug?._errors?.map((err, idx) => (
                <p
                  key={idx}
                  className="my-5 bg-red-500  text-white rounded-md px-3 py-2"
                >
                  {err}
                </p>
              ))}
            </div>
          )}

          {orgSlugInfo.isChecking && (
            <p className="my-5 flex gap-2 items-center bg-fuchsia-700  text-white rounded-md px-3 py-2">
              <Loader2 className="mr-2 animate-spin" />
              Checking availability...
            </p>
          )}
          {orgSlugInfo.hasInteracted &&
            !orgSlugInfo.isChecking &&
            orgSlugInfo.isAvailable && (
              <p className="my-5 flex gap-2 items-center bg-green-700  text-white rounded-md px-3 py-2">
                <Check /> Slug is available
              </p>
            )}
          {orgSlugInfo.hasInteracted &&
            !orgSlugInfo.isChecking &&
            !orgSlugInfo.isAvailable && (
              <p className="my-5 flex gap-2 items-center bg-red-700  text-white rounded-md px-3 py-2">
                Try another slug
              </p>
            )}
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
            placeholder="4+ characters"
            // onChange={}
            required
            className={cn(
              error || validationIssue?.userName
                ? "border-red-600"
                : "border-slate-600",
              "px-3 w-full  py-2 rounded-md border-2"
            )}
          />

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

          {userNameInfo.isChecking && (
            <p className="my-5 flex gap-2 items-center bg-fuchsia-700  text-white rounded-md px-3 py-2">
              <Loader2 className="mr-2 animate-spin" />
              Checking availability...
            </p>
          )}
          {userNameInfo.hasInteracted &&
            !userNameInfo.isChecking &&
            userNameInfo.isAvailable && (
              <p className="my-5 flex gap-2 items-center bg-green-700  text-white rounded-md px-3 py-2">
                <Check /> Slug is available
              </p>
            )}
          {userNameInfo.hasInteracted &&
            !userNameInfo.isChecking &&
            !userNameInfo.isAvailable && (
              <p className="my-5 flex gap-2 items-center bg-red-700  text-white rounded-md px-3 py-2">
                Try another slug
              </p>
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
                  <ImSpinner8 className="animate-spin  mr-2 " />
                </>
              ) : (
                <>Signup</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default OrganizationSignupForm;
