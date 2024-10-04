"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

import { AlertTriangle, Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { type ZodFormattedError } from "zod";

import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Category } from "@/db/schema";
import { cn } from "@/lib/utils";
import { env } from "@/utils/env/client";
import { OtherInfoSchema } from "@/validations/other-info";

const OtherInformation = ({
  courseId,
  coursePrice,
  categories,
  isFree,
  exisitingImage,
  teacherName,
  validity,
  existingCategories,
}: {
  courseSlug?: string;
  teacherName?: string;
  categories?: Category[];
  isFree?: boolean;
  courseId?: string;
  exisitingImage?: string | null;
  coursePrice?: number | null;
  currentCategory: {
    courseId: string;
    categoryId: string;
  }[];
  existingCategories: string[];
  validity: number | null;
}) => {
  const imageRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(exisitingImage ?? "");
  const [imageUploading, setImageUploading] = useState(false);
  const [customError, setCustomError] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    existingCategories ?? []
  );

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    OtherInfoSchema,
    string
  > | null>(null);

  const router = useRouter();
  const handleCreateCourse = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setCustomError(false);
    const formData = new FormData(e.currentTarget);

    const coursePrice = formData.get("coursePrice");
    const teacherName = formData.get("teacherName");
    const courseValidity = formData.get("courseValidity");

    try {
      const parsedResult = OtherInfoSchema.safeParse({
        coursePrice: Number(coursePrice ?? 0),
        courseIsFree: isFree,
        courseValidity: Number(courseValidity),
        teacherName,
        courseCategories: selectedCategories,
        courseImg: imageUrl,
      });

      if (!parsedResult.success) {
        const err = parsedResult.error.format();
        setFormErrors(err);
        return;
      }

      const res = await fetch(`/api/courses/${courseId}/other`, {
        method: "PATCH",
        body: JSON.stringify(parsedResult.data),
      });

      const resData = await res.json();
      if (res.status === 400) {
        if (resData.error.code === "validation_error") {
          setFormErrors(resData.error.message);
        }

        if (resData.error.code === "server_error") {
          setCustomError(true);
        }
      }
      if (res.status === 200) {
        router.refresh();
        // router.push(`/dashboard/courses`);
      }
    } catch (error) {
      toast.error("Server Error. Please try again");
      setCustomError(true);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleImageUpload() {
    setImageUploading(true);
    const formData = new FormData();
    const file = imageRef?.current?.files?.[0];

    if (!file) {
      return;
    }
    formData.append("image", file!);

    try {
      const imageUpload = await fetch(
        `${env.NEXT_PUBLIC_BACKEND_URL}/v1/image`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const imageUploadRes = await imageUpload.json();
      setImageUrl(imageUploadRes.data);
    } catch (error) {
    } finally {
      setImageUploading(false);
    }
  }

  const courseValidity = [
    {
      key: "1 month",
      value: "30",
    },
    {
      key: "2 month",
      value: "60",
    },
    {
      key: "6 month",
      value: "180",
    },
    {
      key: "12 month",
      value: "365",
    },
    {
      key: "2 years",
      value: "730",
    },
    {
      key: "Unlimited",
      value: "-1",
    },
  ];
  return (
    <>
      <div className="auth-options flex w-full flex-col items-center justify-center px-6">
        <form
          onSubmit={handleCreateCourse}
          className="mx-auto w-[100%] md:w-3/4 lg:w-1/2"
        >
          {!isFree && (
            <>
              <label htmlFor="coursePrice" className="mt-5 block">
                Course Price
              </label>
              <input
                type="number"
                name="coursePrice"
                defaultValue={coursePrice ?? ""}
                id="coursePrice"
                placeholder="Price of the course"
                className={`${
                  formErrors?.coursePrice || customError
                    ? "border-red-600"
                    : "border-slate-400"
                } w-full rounded-md border-2 px-3 py-2`}
              />
              {formErrors?.coursePrice && (
                <>
                  {formErrors.coursePrice._errors.map((err, index) => (
                    <div key={index}>
                      <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                        <AlertTriangle />
                        {err}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
          <label htmlFor="teacherName" className="mt-5 block">
            Teacher(s) Name
          </label>
          <input
            type="text"
            name="teacherName"
            id="teacherName"
            defaultValue={teacherName}
            placeholder="Name of the teacher"
            className={`${
              formErrors?.teacherName || customError
                ? "border-red-600"
                : "border-slate-400"
            } w-full rounded-md border-2 px-3 py-2`}
          />

          {formErrors?.teacherName && (
            <>
              {formErrors.teacherName._errors.map((err, index) => (
                <div key={index}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <AlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          <label htmlFor="courseCategoryId" className="mt-5 block">
            Course Category
          </label>
          <MultiSelect
            className="rounded-md border-2 border-slate-400"
            options={categories!.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            onValueChange={(value) => {
              setSelectedCategories(value);
            }}
            defaultValue={selectedCategories}
            placeholder="Select options"
            variant="inverted"
            animation={2}
            maxCount={4}
          />

          <label htmlFor="courseValidity" className="mt-5 block">
            Course Validity
          </label>
          <select
            name="courseValidity"
            className="w-full rounded-md border-2 border-slate-400 px-3 py-2"
            defaultValue={validity ?? -1}
            id="category"
          >
            {courseValidity?.map((validity) => (
              <option
                className="border-2"
                key={validity.value}
                value={validity.value}
              >
                {validity.key}
              </option>
            ))}
          </select>

          <div
            onClick={() => imageRef?.current?.click()}
            onChange={handleImageUpload}
            className={cn(
              formErrors?.courseImg || customError
                ? "border-red-600 text-red-600"
                : "border-slate-600",
              "mt-5 flex h-[400px] cursor-pointer items-center justify-center rounded-md border-2 border-dashed"
            )}
          >
            {imageUploading ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Uploading Image
              </>
            ) : null}
            {imageUrl.length > 1 && (
              <div className="flex flex-col items-center justify-center px-5">
                <Image
                  width={640}
                  height={360}
                  src={imageUrl}
                  alt="Uploaded image"
                />

                <button
                  className="mt-5 rounded-md bg-red-600 px-4 py-1 text-white"
                  onClick={() => setImageUrl("")}
                >
                  Use another image
                </button>
              </div>
            )}
            {!imageUploading && imageUrl.length < 1 ? (
              <>
                <Upload className="mr-2" />
                Upload image
                <input
                  ref={imageRef!}
                  type="file"
                  name="courseImg"
                  hidden
                  accept="image/*"
                />
              </>
            ) : null}
          </div>

          {formErrors?.courseImg && (
            <>
              {formErrors.courseImg._errors.map((err, index) => (
                <div key={index}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <AlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          {customError && (
            <div className="mt-3 flex items-center gap-3 rounded-md bg-red-600 px-3 py-2 text-white">
              <AlertTriangle /> Server Error please try again.
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
                <Loader2 className="mx-auto animate-spin" />
              ) : (
                "Update Course"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default OtherInformation;
