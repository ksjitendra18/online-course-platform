"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import useChapterStore from "@/store/chapter";
import { env } from "@/utils/env/client";

interface Props {
  exisitingImage?: string;
}

const ChapterAttachment = ({ exisitingImage }: Props) => {
  const { setResource } = useChapterStore();
  const assetRef = useRef<HTMLInputElement | null>(null);

  const [imageUrl, setImageUrl] = useState(exisitingImage ?? "");
  const [imageUploading, setImageUploading] = useState(false);
  const [customError, setCustomError] = useState(false);

  async function handleImageUpload() {
    setImageUploading(true);
    const formData = new FormData();
    const file = assetRef?.current?.files?.[0];

    if (!file) {
      return;
    }
    formData.append("image", file!);

    try {
      const imageUpload = await fetch(
        `${env.NEXT_PUBLIC_BACKEND_URL}/attachment`,
        {
          method: "POST",
          body: formData,
        }
      );
      const imageUploadRes = await imageUpload.json();
      setImageUrl(imageUploadRes.data);
      setResource(imageUploadRes.data);

      toast.success("File Uploaded Successfully");
    } catch (error) {
      setCustomError(true);
    } finally {
      setImageUploading(false);
    }
  }

  return (
    <>
      <div
        onClick={() => assetRef?.current?.click()}
        onChange={handleImageUpload}
        className={cn(
          customError ? "border-red-600 text-red-600" : "border-slate-600",
          "mt-5 flex h-[400px] cursor-pointer items-center justify-center rounded-md border-2 border-dashed"
        )}
      >
        {imageUploading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            Uploading
          </>
        ) : null}
        {imageUrl.length > 1 && (
          <div className="flex flex-col items-center justify-center px-5">
            <Image fill src={imageUrl} alt="Uploaded image" />

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
              ref={assetRef!}
              type="file"
              name="courseImg"
              hidden
              accept="image/*"
            />
          </>
        ) : null}
      </div>
    </>
  );
};

export default ChapterAttachment;
