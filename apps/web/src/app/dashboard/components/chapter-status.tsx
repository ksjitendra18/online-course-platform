"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ChapterStatus = ({
  courseId,
  chapterId,
}: {
  status: "draft" | "published" | "archived" | "deleted";
  courseId: string;
  chapterId: string;
  moduleId: string;
}) => {
  const router = useRouter();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "published",
          }),
        }
      );

      if (res.status === 200) {
        closeBtnRef.current?.click();
        toast.success("Chapter published successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("Error while publishing chapter");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="app">Publish</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will publish the chapter and its associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center">
            <DialogClose asChild>
              <Button ref={closeBtnRef} variant={"outline"}>
                Cancel
              </Button>
            </DialogClose>

            <Button onClick={handleClick} variant="default">
              {loading ? (
                <Loader2 className="mx-auto animate-spin" />
              ) : (
                <>Publish</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChapterStatus;
