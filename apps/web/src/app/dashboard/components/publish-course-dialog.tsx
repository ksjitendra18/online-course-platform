"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button, ButtonProps } from "@/components/ui/button";
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

type PublishCourseDialogProps = {
  triggerMsg: string;
  variant: ButtonProps["variant"];
  courseId: string;
  fetchPublishStatus: () => void;
};

const PublishCourseDialog = ({
  triggerMsg,
  variant,
  courseId,
  fetchPublishStatus,
}: PublishCourseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${courseId}/publish`, {
        method: "POST",
      });

      if (res.status === 200) {
        toast.success("Course published successfully");
        router.refresh();
      } else {
        toast.error("Error while publishing course");
      }
    } catch (error) {
      toast.error("Error while publishing course");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Dialog onOpenChange={(open) => open && fetchPublishStatus()}>
        <DialogTrigger asChild>
          <Button variant={variant}>{triggerMsg}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Publish Course</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Publish your course to the marketplace
          </DialogDescription>

          <p>
            Please make sure that content is arranged and ready to be published.
            Before publishing, please review all the content.
          </p>
          <DialogFooter className="flex items-center">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>

            <Button
              disabled={loading}
              onClick={handlePublish}
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
    </div>
  );
};

export default PublishCourseDialog;
