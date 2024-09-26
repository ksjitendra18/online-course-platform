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

const ModuleStatus = ({
  status,
  courseId,
  moduleId,
}: {
  status: "draft" | "published" | "archived" | "deleted";
  courseId: string;
  moduleId: string;
}) => {
  const router = useRouter();
  let closeBtnRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "published",
        }),
      });

      if (res.status === 200) {
        closeBtnRef.current?.click();
        toast.success("Module Deleted Successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("Error while deleting module");
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
              This will publish this module and chapter which has been marked as
              published.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center">
            <DialogClose asChild>
              <Button variant={"ghost"} ref={closeBtnRef}>
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

export default ModuleStatus;
