"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  AlertTriangle,
  Check,
  Info,
  Loader,
  Loader2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import slugify from "slugify";
import { type ZodFormattedError } from "zod";

import VideoPlayer from "@/app/courses/_components/video-player";
import { Button } from "@/components/ui/button";
import { capitalizeFirstWord, cn } from "@/lib/utils";
import useQuizDataStore from "@/store/quiz-data";
import { ChapterInfoSchema } from "@/validations/chapter-info";

import ChapterAttachment from "./chapter-attachment";
import ChapterQuiz from "./chapter-quiz";
import ChapterText from "./chapter-text";

const ChapterEditForm = ({
  moduleId,
  courseId,
  courseSlug,
  chapterId,
  isCourseFree,
  moduleSlug,
  chapterSlug,
  chapterName,
  chapterDescription,
  isChapterFree,
  type,
  videoData,
}: {
  courseSlug: string;
  isCourseFree: boolean;
  courseId: string;
  chapterId: string;
  moduleId: string;
  moduleSlug: string;
  chapterSlug: string;
  chapterName: string;
  chapterDescription: string;
  type: string;
  isChapterFree: boolean;
  videoData: { playbackId: string; duration: number } | undefined;
}) => {
  let videoInput = useRef<HTMLInputElement | null>(null);

  const [chapterType, setChapterType] = useState(type);

  const router = useRouter();

  const [loading, setIsLoading] = useState(false);
  const [slug, setSlug] = useState(chapterSlug);

  const [videoUploadError, setVideoUploadError] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoId, setVideoId] = useState(videoData?.playbackId ?? "");
  const [newVideoId, setNewVideoId] = useState("");
  const [updateVideo, setUpdateVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(videoData?.duration ?? 0);
  const [customError, setCustomError] = useState(false);
  const [chapterPaid, setChapterPaid] = useState(!isChapterFree);

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    ChapterInfoSchema,
    string
  > | null>(null);

  // disable the button if the question length is less than 1
  // modal increases or decreases the question
  const { questionLength, setQuestionLength } = useQuizDataStore();

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
        resourceData: updateVideo ? newVideoId : videoId,
        isFree: !chapterPaid,
        type: chapterType,
      });

      if (!parsedResult.success) {
        const err = parsedResult.error.format();
        setFormErrors(err);

        return;
      }

      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ ...parsedResult.data, updateVideo }),
        }
      );

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
        toast.success("Edited Successfully");
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
      const vidUpload = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/v1/video`, {
        method: "POST",
        body: formData,
      });
      const vidUploadRes = await vidUpload.json();

      setNewVideoId(vidUploadRes.videoId);
      setVideoDuration(vidUploadRes.duration);

      toast.success("Video Uploaded. Please wait while we process the video.");
    } catch (error) {
      setVideoUploadError(true);
      toast.error("Couldn't upload video. Try again later");
    } finally {
      setIsVideoUploading(false);
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
      <div className="auth-options flex w-full flex-col items-center justify-center px-6">
        <form
          ref={formRef}
          onSubmit={handleCreateCourse}
          className="mx-auto w-[100%] md:w-3/4 lg:w-1/2"
        >
          <label htmlFor="chapterName" className="mt-5 block text-gray-600">
            Chapter Name
          </label>
          <input
            type="text"
            name="chapterName"
            id="chapterName"
            defaultValue={chapterName}
            onChange={(e) => {
              setSlug(slugify(e.target.value, { lower: true }));
            }}
            placeholder="Name of the chapter"
            className={`${
              formErrors?.chapterName || customError
                ? "border-red-600"
                : "border-slate-400"
            } w-full rounded-md border-2 px-3 py-2`}
          />

          {formErrors?.chapterName && (
            <>
              {formErrors.chapterName._errors.map((err) => (
                <div key={err}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <AlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          <label htmlFor="chapterSlug" className="mt-5 block text-gray-600">
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
            } w-full rounded-md border-2 px-3 py-2`}
          />

          {formErrors?.chapterSlug && (
            <>
              {formErrors.chapterSlug._errors.map((err, index) => (
                <div key={index}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <AlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          <label
            htmlFor="chapterDescription"
            className="mt-5 block text-gray-600"
          >
            Chapter Description
          </label>
          <textarea
            defaultValue={chapterDescription}
            name="chapterDescription"
            id="chapterDescription"
            // value={chapterDescription}
            placeholder="Description of the chapter (under 300 words)"
            className={`${
              formErrors?.chapterDescription || customError
                ? "border-red-600"
                : "border-slate-400"
            } w-full rounded-md border-2 px-3 py-2`}
          />

          {formErrors?.chapterDescription && (
            <>
              {formErrors.chapterDescription._errors.map((err) => (
                <div key={err}>
                  <div className="mt-2 flex items-center gap-3 py-1 text-red-600">
                    <AlertTriangle />
                    {err}
                  </div>
                </div>
              ))}
            </>
          )}

          {!isCourseFree && (
            <>
              <label className="mt-5 inline-flex text-gray-600">
                This will be:
                <span data-tooltip-target="tooltip-default" className="tooltip">
                  <Info />
                </span>
              </label>

              <div
                id="tooltip-default"
                role="tooltip"
                className="tooltip invisible absolute z-10 inline-block w-1/2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300 dark:bg-gray-700"
              >
                You can have some chapters for demo to be set as free. If you
                want entire course to free then please set course to be free the
                others information. Then every new chapter will be automatically
                marked as free
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div className="mt-2 flex items-center gap-4">
                <div
                  onClick={() => setChapterPaid(true)}
                  className={cn(
                    chapterPaid
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                    "cursor-pointer rounded-md px-3 py-1"
                  )}
                >
                  Paid Chapter
                </div>
                <div
                  onClick={() => setChapterPaid(false)}
                  className={cn(
                    !chapterPaid
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 hover:bg-blue-500/80 hover:text-white",
                    "cursor-pointer rounded-md px-3 py-1"
                  )}
                >
                  Free Chapter
                </div>
              </div>
            </>
          )}

          <label className="mt-5 inline-flex text-gray-600">
            Chapter Type:
          </label>
          <div className="mt-2 flex items-center gap-4">
            <div className="cursor-pointer rounded-md bg-blue-500 px-3 py-1 text-white">
              {capitalizeFirstWord(chapterType)}
            </div>
          </div>

          {chapterType === "video" && (
            <div>
              {!isVideoUploading && videoId.length < 1 ? (
                <>
                  <div
                    onClick={() => {
                      videoInput?.current?.click();
                    }}
                    className="my-5 flex h-[400px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-600"
                  >
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
                    {newVideoId.length > 1 && (
                      <div className="flex gap-2">
                        <Check className="stroke-2 text-green-500" />
                        <span className="text-green-500">
                          Video Uploaded Successfully
                        </span>
                      </div>
                    )}
                  </div>
                  {newVideoId.length < 1 && (
                    <div className="flex items-center justify-center">
                      <Button
                        variant="app"
                        className="mx-auto mt-1"
                        onClick={() => setVideoId(videoData?.playbackId ?? "")}
                      >
                        Restore previous video
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="my-5 flex flex-col items-center justify-between gap-3">
                  <VideoPlayer
                    autoPlay={false}
                    playbackId={videoData?.playbackId!}
                  />

                  <button
                    className="mt-5 rounded-md bg-red-600 px-4 py-1 text-white"
                    onClick={() => setVideoId("")}
                  >
                    Upload new video
                  </button>
                </div>
              )}
              {isVideoUploading && !videoUploadError && (
                <>
                  <Loader className="mr-2 animate-spin" />
                  Uploading the video...
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
            <ChapterQuiz
              moduleId={moduleId}
              courseId={courseId}
              chapterSlug={chapterSlug ?? slug}
            />
          )}
          {chapterType === "article" && <ChapterText />}

          {customError && (
            <div className="mt-3 flex items-center gap-3 rounded-md bg-red-600 px-3 py-2 text-white">
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
              <Loader2 className="mz-auto animate-spin" />
            ) : (
              <>Update Chapter</>
            )}
          </Button>
        </form>
      </div>
    </>
  );
};

export default ChapterEditForm;
