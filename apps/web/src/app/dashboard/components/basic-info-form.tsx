"use client";

// import { AlertTriangle, Info, Loader2 } from "lucide-solid";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

import { Info, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";
import slugify from "slugify";
import { type ZodFormattedError } from "zod";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BasicInfoSchema } from "@/validations/basic-info";

// this same component is responsible for both editing and
// creating that's why it is accepting these props
const BasicInformation = ({
  update,
  courseName,
  courseSlug,
  courseId,
  courseDescription,
  isFree,
}: {
  update?: boolean;
  courseName?: string;
  courseId?: string;
  courseDescription?: string | null;
  courseSlug?: string;
  isFree?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [courseFree, setCourseFree] = useState(isFree ?? false);
  const [customError, setCustomError] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugExists, setSlugExists] = useState(false);
  const [courseLevel, setCourseLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");

  const router = useRouter();

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    BasicInfoSchema,
    string
  > | null>(null);

  const handleCreateCourse = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setCustomError(false);
    setSlugExists(false);
    const formData = new FormData(e.currentTarget);

    const title = formData.get("title");
    const slug = formData.get("slug");
    const description = formData.get("description");

    try {
      const parsedResult = BasicInfoSchema.safeParse({
        title,
        slug,
        description,
        isFree: courseFree,
        level: courseLevel,
      });

      if (!parsedResult.success) {
        const err = parsedResult.error.format();
        setFormErrors(err);
        return;
      }

      const reqMethod = update ? "PATCH" : "POST";

      let reqURL = "/api/courses";
      let reqBody = JSON.stringify(parsedResult.data);

      if (reqMethod === "PATCH") {
        reqBody = JSON.stringify({ ...parsedResult.data, courseId });
        reqURL = `/api/courses/${courseId}`;
      }

      const res = await fetch(reqURL, {
        method: reqMethod,
        body: reqBody,
      });

      const resData = await res.json();
      if (res.status === 400) {
        if (resData.error.code === "validation_error") {
          setFormErrors(resData.error.message);
        }
      }

      if (res.status === 500) {
        setCustomError(true);
      }

      if (res.status === 409) {
        setSlugExists(true);
      }
      if (res.status === 201) {
        router.push(`/dashboard/courses/${resData.data.courseSlug}/modules`);
        toast.success("Course created successfully");
      }

      if (res.status === 200) {
        router.refresh();
        toast.success("Course updated successfully");
      }
    } catch (error) {
      toast.success("Error while updating course");
      setCustomError(true);
    } finally {
      setIsLoading(false);
    }
  };

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setSlug(
      slugify(e.target.value, {
        lower: true,
        trim: true,
        remove: /^[":,'-]+$/,
      })
    );
  }

  return (
    <>
      <div className="auth-options flex w-full flex-col items-center justify-center px-6">
        <form
          onSubmit={handleCreateCourse}
          className="mx-auto w-[100%] md:w-3/4 xl:w-1/2"
        >
          <label htmlFor="title" className="mt-5 block text-gray-600">
            Course Name
          </label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={courseName}
            onInput={handleNameChange}
            placeholder="Name of the course"
            className={`${
              formErrors?.title || customError
                ? "border-red-600"
                : "border-slate-400"
            } w-full rounded-md border-2 px-3 py-2`}
          />

          {formErrors?.title && (
            <>
              {formErrors.title._errors.map((err) => (
                <div key={err}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <FiAlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}
          <label htmlFor="slug" className="mt-5 block text-gray-600">
            Course Slug
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            defaultValue={courseSlug ?? slug}
            placeholder="Slug of the course"
            className={`${
              formErrors?.slug || customError
                ? "border-red-600"
                : "border-slate-400"
            } w-full rounded-md border-2 px-3 py-2`}
          />

          {formErrors?.slug && (
            <>
              {formErrors.slug._errors.map((err, index) => (
                <div key={index}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <FiAlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          {slugExists && (
            <>
              <div className="mt-2 flex items-center gap-3 rounded-md bg-red-600 px-3 py-1 text-white">
                <FiAlertTriangle className="mr-2" />A course with this slug
                already exists. Please choose another slug
              </div>
            </>
          )}

          <label className="mt-5 inline-flex text-gray-600">
            This will be:
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <Info />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    For paid Courses, you can have some chapters for demo to be
                    set as free.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>

          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCourseFree(false)}
              className={cn(
                !courseFree
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                "cursor-pointer rounded-md px-3 py-1"
              )}
            >
              Paid Course
            </button>
            <button
              type="button"
              onClick={() => setCourseFree(true)}
              className={cn(
                courseFree
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                "cursor-pointer rounded-md px-3 py-1"
              )}
            >
              Free Course
            </button>
          </div>

          <label className="mt-5 inline-flex text-gray-600">
            This course is intended for:
          </label>

          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCourseLevel("beginner")}
              className={cn(
                courseLevel === "beginner"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                "cursor-pointer rounded-md px-3 py-1"
              )}
            >
              Beginner
            </button>
            <button
              type="button"
              onClick={() => setCourseLevel("intermediate")}
              className={cn(
                courseLevel === "intermediate"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                "cursor-pointer rounded-md px-3 py-1"
              )}
            >
              Intermediate
            </button>
            <button
              type="button"
              onClick={() => setCourseLevel("advanced")}
              className={cn(
                courseLevel === "advanced"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                "cursor-pointer rounded-md px-3 py-1"
              )}
            >
              Advanced
            </button>
          </div>

          <label htmlFor="description" className="mt-5 block text-gray-600">
            Course Description
          </label>
          <textarea
            name="description"
            id="description"
            placeholder="Description of the course (under 300 words)"
            defaultValue={courseDescription ?? ""}
            className={`${
              formErrors?.description || customError
                ? "border-red-600"
                : "border-slate-400"
            } w-full rounded-md border-2 px-3 py-2`}
          ></textarea>
          {formErrors?.description && (
            <>
              {formErrors.description._errors.map((err, index) => (
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
            <Button variant="app" disabled={isLoading} className="my-5 w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mx-auto animate-spin" />
                </>
              ) : (
                <>{update ? "Update Course" : "Create Course"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BasicInformation;
