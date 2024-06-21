"use client";

import { cn } from "@/lib/utils";
import useChapterStore from "@/store/chapter";
import { AlertTriangle, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  exisitingImage?: string;
}

const ChapterAttachment = ({ exisitingImage }: Props) => {
  const { setResource } = useChapterStore();
  let assetRef = useRef<HTMLInputElement | null>(null);

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/attachment`,
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
          "flex mt-5 cursor-pointer items-center justify-center h-[400px] rounded-md border-2  border-dashed"
        )}
      >
        {imageUploading ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Uploading
          </>
        ) : null}
        {imageUrl.length > 1 && (
          <div className="px-5 flex flex-col items-center justify-center">
            <Image fill src={imageUrl} alt="Uploaded image" />

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
