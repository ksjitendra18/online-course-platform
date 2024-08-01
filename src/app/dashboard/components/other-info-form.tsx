"use client";
import { AlertTriangle, Loader2, Upload } from "lucide-react";
import { type ZodFormattedError } from "zod";

import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Category } from "@/db/schema";
import { cn } from "@/lib/utils";
import { OtherInfoSchema } from "@/validations/other-info";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const OtherInformation = ({
  courseId,
  coursePrice,
  categories,
  isFree,
  exisitingImage,
  teacherName,
  validity,
  currentCategory,
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
  let imageRef = useRef<HTMLInputElement | null>(null);

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
  const handleCreateCourse = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setCustomError(false);
    const formData = new FormData(e.target);

    const coursePrice = formData.get("coursePrice");
    const teacherName = formData.get("teacherName");
    // const courseCategoryId = formData.get("courseCategoryId");
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
        router.push(`/dashboard/courses`);
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/image`,
        {
          method: "POST",
          body: formData,
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
      value: "360",
    },
    {
      key: "2 years",
      value: "720",
    },
    {
      key: "Unlimited",
      value: "0",
    },
  ];
  return (
    <>
      <div className="auth-options w-full px-6 flex flex-col items-center justify-center">
        <form
          onSubmit={handleCreateCourse}
          className="w-[100%] mx-auto md:w-3/4 lg:w-1/2"
        >
          {!isFree && (
            <>
              <label htmlFor="coursePrice" className=" mt-5 block ">
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
                } px-3 w-full  py-2 rounded-md border-2 `}
              />
              {formErrors?.coursePrice && (
                <>
                  {formErrors.coursePrice._errors.map((err, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-3 text-red-600 py-1 mt-2">
                        <AlertTriangle />
                        {err}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
          <label htmlFor="teacherName" className=" mt-5 block ">
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
            } px-3 w-full  py-2 rounded-md border-2 `}
          />

          {formErrors?.teacherName && (
            <>
              {formErrors.teacherName._errors.map((err, index) => (
                <div key={index}>
                  <div className="flex items-center gap-3 text-red-600 py-1 mt-2">
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
            className="border-2 border-slate-400 rounded-md"
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
            className="w-full rounded-md border-slate-400 border-2 px-3 py-2"
            defaultValue={validity ?? 0}
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
              "flex mt-5 cursor-pointer items-center justify-center h-[400px] rounded-md border-2  border-dashed"
            )}
          >
            {imageUploading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Uploading Image
              </>
            ) : null}
            {imageUrl.length > 1 && (
              <div className="px-5 flex  flex-col items-center justify-center">
                <Image
                  width={640}
                  height={360}
                  src={imageUrl}
                  alt="Uploaded image"
                />

                <button
                  className="mt-5 bg-red-600 text-white rounded-md px-4 py-1"
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
                  <div className="flex items-center gap-3 text-red-600 py-1 mt-2">
                    <AlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          {customError && (
            <div className="text-white flex items-center gap-3 rounded-md bg-red-600 px-3 py-2 mt-3">
              <AlertTriangle /> Server Error please try again.
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="app"
              type="submit"
              disabled={isLoading}
              className="w-full my-5"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mx-auto" />
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
