"use client";
// import { AlertTriangle, Info, Loader2 } from "lucide-solid";
import { FiAlertTriangle, FiInfo } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { type ZodFormattedError } from "zod";

import slugify from "slugify";
import { cn } from "@/lib/utils";
import { ChangeEvent, FormEvent, useState } from "react";
import { BasicInfoSchema } from "@/validations/basic-info";
import { useRouter } from "next/navigation";
import { ModuleInfoSchema } from "@/validations/module-info";

// this same component is responsible for both editing and
// creating that's why it is accepting these props
const ModuleInformation = ({
  update,
  moduleSlug,
  moduleName,
  courseId,
  courseSlug,
  moduleDescription,
}: {
  update?: boolean;
  moduleName?: string;
  courseId?: string;
  moduleSlug?: string;
  courseSlug?: string;
  moduleDescription?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customError, setCustomError] = useState(false);
  const [slug, setSlug] = useState("");

  const router = useRouter();

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    ModuleInfoSchema,
    string
  > | null>(null);

  const handleCreateModule = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setCustomError(false);
    const formData = new FormData(e.target);

    const moduleName = formData.get("moduleName");
    const moduleSlug = formData.get("moduleSlug");
    const moduleDescription = formData.get("moduleDescription");

    try {
      const parseResult = ModuleInfoSchema.safeParse({
        moduleName,
        moduleSlug,
        moduleDescription,
      });

      if (!parseResult.success) {
        const err = parseResult.error.format();
        setFormErrors(err);
        return;
      }

      const reqMethod = update ? "PATCH" : "POST";

      const res = await fetch("/api/modules", {
        method: reqMethod,
        body: JSON.stringify({ courseId, ...parseResult.data }),
      });

      const resData = await res.json();
      if (res.status === 400) {
        if (resData.error === "validation_error") {
          setFormErrors(resData.message);
        }

        if (resData.error === "server_error") {
          setCustomError(true);
        }
      }
      if (res.status === 201) {
        router.refresh();
        router.push(`/dashboard/courses/${courseSlug}/modules`);
      }
    } catch (error) {
      setCustomError(true);
    } finally {
      setIsLoading(false);
    }
  };

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setSlug(slugify(e.target.value, { lower: true }));
  }

  return (
    <>
      <div className="auth-options w-full px-6 flex flex-col items-center justify-center">
        <form
          onSubmit={handleCreateModule}
          className="w-[100%] mx-auto md:w-3/4 lg:w-1/2"
        >
          <label htmlFor="moduleName" className=" mt-5 block text-gray-600">
            Module Name
          </label>
          <input
            type="text"
            name="moduleName"
            id="moduleName"
            defaultValue={moduleName}
            onChange={handleNameChange}
            placeholder="Name of the module"
            className={`${
              formErrors?.moduleName || customError
                ? "border-red-600"
                : "border-slate-400"
            } px-3 w-full  py-2 rounded-md border-2 `}
          />

          {formErrors?.moduleName && (
            <>
              {formErrors.moduleName._errors.map((err) => (
                <div key={err}>
                  <div className="flex items-center gap-3 text-red-600 py-1 mt-2">
                    <FiAlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}
          <label htmlFor="moduleSlug" className=" mt-5 block text-gray-600">
            Module Slug
          </label>
          <input
            type="text"
            name="moduleSlug"
            id="moduleSlug"
            defaultValue={moduleSlug ?? slug}
            placeholder="Slug of the course"
            className={`${
              formErrors?.moduleSlug || customError
                ? "border-red-600"
                : "border-slate-400"
            } px-3 w-full  py-2 rounded-md border-2 `}
          />

          {formErrors?.moduleSlug && (
            <>
              {formErrors.moduleSlug._errors.map((err, index) => (
                <div key={index}>
                  <div className="flex items-center gap-3 text-red-600 py-1 mt-2">
                    <FiAlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          <label
            htmlFor="moduleDescription"
            className=" mt-5 block text-gray-600"
          >
            Course Description
          </label>
          <textarea
            name="moduleDescription"
            id="moduleDescription"
            placeholder="Description of the course (under 300 words)"
            defaultValue={moduleDescription ?? ""}
            className={`${
              formErrors?.moduleDescription || customError
                ? "border-red-600"
                : "border-slate-400"
            } px-3 w-full  py-2 rounded-md border-2 `}
          ></textarea>
          {formErrors?.moduleDescription && (
            <>
              {formErrors.moduleDescription._errors.map((err, index) => (
                <div key={index}>
                  <div className="flex items-center gap-3 text-red-600 py-1 mt-2">
                    <FiAlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          {customError && (
            <div className="text-white flex items-center gap-3 rounded-md bg-red-600 px-3 py-2 mt-3">
              <FiAlertTriangle /> Server Error please try again.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`${
                isLoading ? "bg-blue-500 scale-95" : "bg-blue-600"
              } mt-5 w-full px-10 py-2  border-2 border-solid border-mainbg rounded-md text-white hover:scale-95 duration-100 ease-in `}
            >
              {isLoading ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <ImSpinner8 className={"animate-spin"} />
                    {update ? "Updating Module..." : "Creating Module..."}
                  </div>
                </>
              ) : (
                <>{update ? "Update Module" : "Create Module"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ModuleInformation;
