"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";
import slugify from "slugify";
import { type ZodFormattedError } from "zod";

import { Button } from "@/components/ui/button";
import { ModuleInfoSchema } from "@/validations/module-info";

// this same component is responsible for both editing and
// creating that's why it is accepting these props
const ModuleInformation = ({
  update,
  moduleSlug,
  moduleName,
  courseId,
  courseSlug,
  moduleId,
  moduleDescription,
}: {
  update?: boolean;
  moduleName?: string;
  courseId?: string;
  moduleSlug?: string;
  courseSlug?: string;
  moduleId?: string;
  moduleDescription?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customError, setCustomError] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugExists, setSlugExists] = useState(false);
  const router = useRouter();

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    ModuleInfoSchema,
    string
  > | null>(null);

  const handleCreateModule = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setCustomError(false);
    setSlugExists(false);
    const formData = new FormData(e.currentTarget);

    const moduleName = formData.get("moduleName");
    const moduleSlug = formData.get("moduleSlug");
    const moduleDescription = formData.get("moduleDescription");

    try {
      const parsedResult = ModuleInfoSchema.safeParse({
        moduleName,
        moduleSlug,
        moduleDescription,
      });

      if (!parsedResult.success) {
        const err = parsedResult.error.format();
        setFormErrors(err);
        return;
      }

      const reqMethod = update ? "PATCH" : "POST";

      const reqUrl = update
        ? `/api/courses/${courseId}/modules/${moduleId}`
        : `/api/courses/${courseId}/modules`;

      const res = await fetch(reqUrl, {
        method: reqMethod,
        body: JSON.stringify(parsedResult.data),
      });

      const resData = await res.json();
      if (res.status === 400) {
        if (resData.error.code === "validation_error") {
          setFormErrors(resData.error.message);
        }
      }

      if (res.status === 409) {
        setSlugExists(true);
      }
      if (res.status === 201 || res.status === 200) {
        toast.success("Saved Successfully");
        router.push(`/dashboard/courses/${courseSlug}/modules`);
        router.refresh();
      }
    } catch (error) {
      setCustomError(true);
      toast.error("Error while saving details");
    } finally {
      setIsLoading(false);
    }
  };

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setSlug(slugify(e.target.value, { lower: true }));
  }

  return (
    <>
      <div className="auth-options flex w-full flex-col items-center justify-center px-6">
        <form
          onSubmit={handleCreateModule}
          className="mx-auto w-[100%] md:w-3/4 lg:w-1/2"
        >
          <label htmlFor="moduleName" className="mt-5 block text-gray-600">
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
            } w-full rounded-md border-2 px-3 py-2`}
          />

          {formErrors?.moduleName && (
            <>
              {formErrors.moduleName._errors.map((err) => (
                <div key={err}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <FiAlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}
          <label htmlFor="moduleSlug" className="mt-5 block text-gray-600">
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
            } w-full rounded-md border-2 px-3 py-2`}
          />

          {slugExists && (
            <>
              <div className="mt-2 flex items-center gap-3 rounded-md bg-red-600 px-3 py-1 text-white">
                <FiAlertTriangle className="mr-2" />A module with this slug
                already exists for the given course.
              </div>
            </>
          )}
          {formErrors?.moduleSlug && (
            <>
              {formErrors.moduleSlug._errors.map((err, index) => (
                <div key={index}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <FiAlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          <label
            htmlFor="moduleDescription"
            className="mt-5 block text-gray-600"
          >
            Module Description
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
            } w-full rounded-md border-2 px-3 py-2`}
          ></textarea>
          {formErrors?.moduleDescription && (
            <>
              {formErrors.moduleDescription._errors.map((err, index) => (
                <div key={index}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <FiAlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          {customError && (
            <div className="mt-3 flex items-center gap-3 rounded-md bg-red-600 px-3 py-2 text-white">
              <FiAlertTriangle /> Server Error please try again.
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="app"
              type="submit"
              disabled={isLoading}
              className="my-5 w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mx-auto animate-spin" />
                </>
              ) : (
                <>{update ? "Update Module" : "Create Module"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ModuleInformation;
