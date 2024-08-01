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
import { usePathname, useRouter } from "next/navigation";
import slugify from "slugify";
import toast from "react-hot-toast";
import ChapterAttachment from "./chapter-attachment";
import ChapterQuiz, { QData } from "./chapter-quiz";
import ChapterText from "./chapter-text";
import useSWR from "swr";
import useQuizDataStore from "@/store/quiz-data";
import { Button } from "@/components/ui/button";

const ChapterInformation = ({
  moduleId,
  courseId,
  courseSlug,
  isCourseFree,
  update,
  moduleSlug,
  chapterSlug,
}: {
  courseSlug?: string;
  isCourseFree?: boolean;
  chapterSlug?: string;
  courseId: string;
  chapterId?: string;
  moduleId: string;
  moduleSlug: string;
  update?: boolean;
}) => {
  let videoInput = useRef<HTMLInputElement | null>(null);

  const [chapterType, setChapterType] = useState<
    "video" | "quiz" | "article" | "attachment"
  >("video");

  const [chapterTypeDisabled, setChapterTypeDisabled] = useState(false);

  const pathname = usePathname();

  const router = useRouter();

  const [loading, setIsLoading] = useState(false);
  const [slug, setSlug] = useState("");

  // const [sumbitDisable, setSubmitDisable] = useState(true);
  const [videoUploadError, setVideoUploadError] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [customError, setCustomError] = useState(false);
  const [chapterPaid, setChapterPaid] = useState(!isCourseFree);

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    ChapterInfoSchema,
    string
  > | null>(null);

  // disable the button if the question length is less than 1
  // modal increases or decreases the question
  const { questionLength } = useQuizDataStore();

  const formRef = useRef<HTMLFormElement>(null);

  const handleCreateCourse = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setCustomError(false);

    if (questionLength > 0) {
      router.push(`/dashboard/courses/${courseSlug}/modules/${moduleSlug}`);
      router.refresh();
    }

    const formData = new FormData(e.target);

    const chapterName = formData.get("chapterName");
    const chapterSlug = formData.get("chapterSlug");
    const chapterDescription = formData.get("chapterDescription");

    try {
      const parsedResult = ChapterInfoSchema.safeParse({
        chapterName,
        chapterSlug,
        chapterDescription,
        moduleId,
        courseId,
        duration: videoDuration,
        resourceData: videoId,
        isFree: !chapterPaid,
        type: chapterType,
      });

      if (!parsedResult.success) {
        const err = parsedResult.error.format();
        setFormErrors(err);

        return;
      }

      const reqMethod = update ? "PATCH" : "POST";

      const res = await fetch("/api/chapters", {
        method: reqMethod,
        body: JSON.stringify({ ...parsedResult.data }),
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
      if (res.status === 201 || res.status === 200) {
        router.push(`/dashboard/courses/${courseSlug}/modules/${moduleSlug}`);
        router.refresh();
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
      const vidUpload = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/video`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const vidUploadRes = await vidUpload.json();

      setVideoId(vidUploadRes.data.videoId);
      setVideoDuration(vidUploadRes.data.duration);

      toast.success("Video Uploaded. Please wait while we process the video.");
    } catch (error) {
      setVideoUploadError(true);
      toast.error("Couldn't upload video. Try again later");
    } finally {
      setIsVideoUploading(false);
    }
  };

  const [chapterName, setChapterName] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);

  const handleQuiz = async () => {
    setChapterTypeDisabled(true);
    try {
      setQuizLoading(true);
      const parsedResult = ChapterInfoSchema.safeParse({
        chapterName,
        chapterSlug: slug,
        chapterDescription,
        moduleId,
        courseId,
        resourceData: "quiz",
        isFree: !chapterPaid,
        duration: 0,
        type: "quiz",
      });

      if (!parsedResult.success) {
        const err = parsedResult.error.format();
        setFormErrors(err);
        toast.error("Error");
        return;
      }

      const reqMethod = update ? "PATCH" : "POST";

      const res = await fetch(
        `/api/courses/${parsedResult.data.courseId}/chapters`,
        {
          method: reqMethod,
          body: JSON.stringify({ ...parsedResult.data }),
        }
      );

      const resData = await res.json();

      if (res.status === 201 || res.status === 200) {
        toast.success("Quiz Created");
        const originalUrl = pathname.split("/");
        originalUrl.shift();
        originalUrl.pop();
        const editUrl =
          "/" +
          originalUrl.join("/") +
          `/chapters/${resData.data.chapterSlug}/edit`;

        router.push(editUrl);
      }
    } catch (error) {
      toast.error("Error while creating Quiz. Please try again");
    } finally {
      setQuizLoading(false);
    }
  };

  const isButtonDisabled = () => {
    if (chapterType === "video") {
      if (videoId.length < 1 || loading) {
        return true;
      }
    } else if (chapterType === "quiz") {
      if (questionLength > 0) {
        return false;
      } else {
        return true;
      }
    }

    return false;
  };

  return (
    <>
      <div className="auth-options w-full px-6 flex flex-col items-center justify-center">
        <form
          ref={formRef}
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
            onChange={(e) => {
              setChapterName(e.target.value);
              setSlug(slugify(e.target.value, { lower: true }));
            }}
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

          <label htmlFor="chapterSlug" className=" mt-5 block text-gray-600">
            Chapter Slug
          </label>
          <input
            type="text"
            name="chapterSlug"
            id="chapterSlug"
            defaultValue={chapterSlug ?? slug}
            placeholder="Slug of the chapter"
            className={`${
              formErrors?.chapterSlug || customError
                ? "border-red-600"
                : "border-slate-400"
            } px-3 w-full  py-2 rounded-md border-2 `}
          />

          {formErrors?.chapterSlug && (
            <>
              {formErrors.chapterSlug._errors.map((err, index) => (
                <div key={index}>
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
            onChange={(e) => {
              setChapterDescription(e.target.value);
            }}
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

          <label className=" mt-5 inline-flex text-gray-600">
            Chapter Type:
          </label>
          <div className="flex mt-2 items-center gap-4 ">
            <div
              onClick={() => {
                if (!chapterTypeDisabled) {
                  setChapterType("video");
                } else {
                  toast.error("Chapter Type can't be changed now");
                }
              }}
              className={cn(
                chapterType === "video"
                  ? "text-white bg-blue-500"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                " cursor-pointer  rounded-md px-3 py-1"
              )}
            >
              Video
            </div>
            <div
              onClick={() => {
                if (!chapterTypeDisabled) {
                  setChapterType("quiz");
                  handleQuiz();
                } else {
                  toast.error("Chapter Type can't be changed now");
                }
              }}
              className={cn(
                chapterType === "quiz"
                  ? "text-white bg-blue-500"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                " cursor-pointer  rounded-md px-3 py-1"
              )}
            >
              Quiz
            </div>
            {/* <div
              onClick={() => {
                if (!chapterTypeDisabled) {
                  setChapterType("attachment");
                } else {
                  toast.error("Chapter Type can't be changed now");
                }
              }}
              className={cn(
                chapterType === "attachment"
                  ? "text-white bg-blue-500"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                " cursor-pointer  rounded-md px-3 py-1"
              )}
            >
              Attachment
            </div>
            <div
              onClick={() => {
                if (!chapterTypeDisabled) {
                  setChapterType("article");
                } else {
                  toast.error("Chapter Type can't be changed now");
                }
              }}
              className={cn(
                chapterType === "article"
                  ? "text-white bg-blue-500"
                  : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                " cursor-pointer  rounded-md px-3 py-1"
              )}
            >
              Article
            </div> */}
          </div>

          {chapterType === "video" && (
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
              {isVideoUploading && !videoUploadError && (
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
                  <p className="text-red-600">
                    Error while upload. Please refresh the page and try again.
                  </p>
                </>
              )}
            </div>
          )}

          {chapterType === "attachment" && <ChapterAttachment />}
          {chapterType === "quiz" && (
            <>
              {quizLoading ? (
                <div className="flex items-center justify-center my-10">
                  <Loader2 className="animate-spin mr-2" /> Saving Chapter
                  Information
                </div>
              ) : (
                <ChapterQuiz
                  moduleId={moduleId}
                  courseId={courseId}
                  chapterSlug={chapterSlug ?? slug}
                />
              )}
            </>
          )}
          {chapterType === "article" && <ChapterText />}

          {customError && (
            <div className="text-white flex items-center gap-3 rounded-md bg-red-600 px-3 py-2 mt-3">
              <AlertTriangle /> Server Error please try again.
            </div>
          )}

          <Button
            variant="app"
            type="submit"
            disabled={isButtonDisabled()}
            className="my-5 w-full"
          >
            {loading ? (
              <Loader2 className="animate-spin mz-auto" />
            ) : (
              <>Create Chapter</>
            )}
          </Button>
        </form>
      </div>
    </>
  );
};

export default ChapterInformation;
