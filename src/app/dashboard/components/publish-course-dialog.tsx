"use client";

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
  const [isLoading, setIsLoading] = useState(false);
  const handlePublish = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/courses/${courseId}/publish`, {
        method: "POST",
      });

      if (res.status === 200) {
        toast.success("Course published successfully");
      } else {
        toast.error("Error while publishing course");
      }
    } catch (error) {
      toast.error("Error while publishing course");
    } finally {
      setIsLoading(false);
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
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>

            {isLoading ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              <Button onClick={handlePublish}>Publish</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublishCourseDialog;
