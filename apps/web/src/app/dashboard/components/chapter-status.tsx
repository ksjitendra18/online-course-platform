"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { cn } from "@/lib/utils";

const ChapterStatus = ({
  courseId,
  chapterId,
}: {
  status: "draft" | "published" | "archived" | "deleted";
  courseId: string;
  chapterId: string;
  moduleId: string;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
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
        setOpen(false);
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
      <Dialog open={open} onOpenChange={setOpen}>
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
              <Button variant={"outline"} disabled={loading}>
                Cancel
              </Button>
            </DialogClose>

            <Button
              disabled={loading}
              onClick={handleClick}
              variant="app"
              className="relative"
            >
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  !loading && "invisible"
                )}
              >
                <Loader2 className="animate-spin" />
              </div>

              <span className={cn(loading && "invisible")}>Publish</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChapterStatus;
