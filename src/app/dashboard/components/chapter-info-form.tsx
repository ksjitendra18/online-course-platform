"use client";

import { type ZodFormattedError } from "zod";

import {
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  Info,
  Loader,
  Check,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { ChapterInfoSchema } from "@/validations/chapter-info";
import { useRouter } from "next/navigation";

const ChapterInformation = ({
  moduleId,
  courseId,
  courseSlug,
  isCourseFree,
  update,
  moduleSlug,
}: {
  courseSlug?: string;
  isCourseFree?: boolean;
  courseId: string;
  chapterId?: string;
  moduleId: string;
  moduleSlug: string;
  update?: boolean;
}) => {
  let videoInput = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  // const [sumbitDisable, setSubmitDisable] = useState(true);
  const [videoUploadError, setVideoUploadError] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [customError, setCustomError] = useState(false);
  const [chapterPaid, setChapterPaid] = useState(!isCourseFree);

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    ChapterInfoSchema,
    string
  > | null>(null);

  const handleCreateCourse = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setCustomError(false);
    const formData = new FormData(e.target);

    const chapterName = formData.get("chapterName");

    const chapterDescription = formData.get("chapterDescription");

    try {
      const parseResult = ChapterInfoSchema.safeParse({
        chapterName,
        chapterDescription,
        moduleId,
        courseId,
        videoUrl: videoId,
        isFree: !chapterPaid,
      });

      if (!parseResult.success) {
        const err = parseResult.error.format();
        setFormErrors(err);

        return;
      }

      const reqMethod = update ? "PATCH" : "POST";

      const res = await fetch("/api/chapters", {
        method: reqMethod,
        body: JSON.stringify({ ...parseResult.data }),
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
        router.push(`/dashboard/courses/${courseSlug}/modules/${moduleSlug}`);
      }
    } catch (error) {
      setCustomError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: any) => {
    setVideoUploadError(false);

    const file = videoInput?.current?.files?.[0];

    if (!file) {
      return;
    }

    setIsVideoUploading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("courseId", courseId!);

    try {
      const vidUpload = await fetch("https://vidserver.jsx18.link/video", {
        // const vidUpload = await fetch("http://localhost:8080/video", {
        method: "POST",
        body: formData,
      });
      console.log("uploaded", vidUpload.status);
      const vidUploadRes = await vidUpload.json();

      console.log("uploaded", vidUpload.status, vidUploadRes);
      setVideoId(vidUploadRes.videoId);
      // form.setValue("videoId", vidUploadRes.videoId);

      // toast.success("Video Uploaded. Please wait while we process the video.");
    } catch (error) {
      setVideoUploadError(true);
      console.log("error while uploading", error);
      // toast.error("Couldn't upload video. Try again later");

      // toast;
    } finally {
      setIsVideoUploading(false);
    }
  };

  return (
    <>
      <div className="auth-options w-full px-6 flex flex-col items-center justify-center">
        <form
          onSubmit={handleCreateCourse}
          className="w-[100%] mx-auto md:w-3/4 lg:w-1/2"
        >
          <label htmlFor="chapterName" className=" mt-5 block text-gray-600">
            Chapter Name
          </label>
          <input
            type="text"
            name="chapterName"
            id="chapterName"
            placeholder="Name of the chapter"
            className={`${
              formErrors?.chapterName || customError
                ? "border-red-600"
                : "border-slate-400"
            } px-3 w-full  py-2 rounded-md border-2 `}
          />

          {formErrors?.chapterName && (
            <>
              {formErrors.chapterName._errors.map((err) => (
                <div key={err}>
                  <div className="flex items-center gap-3 text-red-600 py-1 mt-2">
                    <AlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          <label
            htmlFor="chapterDescription"
            className=" mt-5 block text-gray-600"
          >
            Chapter Description
          </label>
          <textarea
            name="chapterDescription"
            id="chapterDescription"
            // value={chapterDescription}
            placeholder="Description of the chapter (under 300 words)"
            className={`${
              formErrors?.chapterDescription || customError
                ? "border-red-600"
                : "border-slate-400"
            } px-3 w-full  py-2 rounded-md border-2 `}
          />

          {formErrors?.chapterDescription && (
            <>
              {formErrors.chapterDescription._errors.map((err) => (
                <div key={err}>
                  <div className="flex items-center gap-3 text-red-600 py-1 mt-2">
                    <AlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          {!isCourseFree && (
            <>
              <label className=" mt-5 inline-flex text-gray-600">
                This will be:
                <span data-tooltip-target="tooltip-default" className="tooltip">
                  <Info />
                </span>
              </label>

              <div
                id="tooltip-default"
                role="tooltip"
                className="absolute z-10 w-1/2 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
              >
                You can have some chapters for demo to be set as free. If you
                want entire course to free then please set course to be free the
                others information. Then every new chapter will be automatically
                marked as free
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div className="flex mt-2 items-center gap-4 ">
                <div
                  onClick={() => setChapterPaid(true)}
                  className={cn(
                    chapterPaid
                      ? "text-white bg-blue-500"
                      : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                    " cursor-pointer  rounded-md px-3 py-1"
                  )}
                >
                  Paid Chapter
                </div>
                <div
                  onClick={() => setChapterPaid(false)}
                  className={cn(
                    !chapterPaid
                      ? "text-white bg-blue-500"
                      : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                    " cursor-pointer  rounded-md px-3 py-1"
                  )}
                >
                  Free Chapter
                </div>
              </div>
            </>
          )}

          <div
            onClick={() => {
              videoInput?.current?.click();
            }}
            className="my-5 flex cursor-pointer items-center justify-center h-[400px] rounded-md border-2 border-slate-600 border-dashed"
          >
            {!isVideoUploading && videoId.length < 1 ? (
              <>
                <Upload className="mr-2" />
                Upload the video
                <input
                  accept="video/*"
                  ref={videoInput}
                  onChange={handleUpload}
                  hidden
                  type="file"
                  name="lecture"
                />
              </>
            ) : null}
            {isVideoUploading && (
              <>
                <Loader className="animate-spin mr-2" />
                Uploading the video...
              </>
            )}

            {videoId.length > 1 && (
              <>
                <Check className="stroke-2 text-green-500" />
                <span className="text-green-500">
                  Video Uploaded Successfully
                </span>
              </>
            )}
            {videoUploadError && (
              <>
                <AlertTriangle />
                <p>
                  Error while upload. Please refresh the page and try again.
                </p>
              </>
            )}
          </div>

          {customError && (
            <div className="text-white flex items-center gap-3 rounded-md bg-red-600 px-3 py-2 mt-3">
              <AlertTriangle /> Server Error please try again.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={videoId.length < 1 || isLoading}
              className={`${
                isLoading ? "bg-blue-500 scale-95" : "bg-blue-600"
              } mt-5 w-full px-10 py-2  disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-solid border-mainbg rounded-md text-white hover:scale-95 duration-100 ease-in `}
            >
              {isLoading ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" />
                    <p>Creating Chapter...</p>
                  </div>
                </>
              ) : (
                <>Create Chapter</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChapterInformation;
