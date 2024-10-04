"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { clearTagCache } from "@/actions/clear-tag-cache";
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

const DeleteCourse = ({ courseId }: { courseId: string }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        await clearTagCache("get-all-courses-admin");
        toast.success("Course Deleted Successfully");
        router.push("/dashboard/courses");
      }
    } catch (error) {
      toast.error("Error while deleting course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will delete all the chapters and their associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center">
            <DialogClose asChild>
              <Button ref={closeBtnRef}>Cancel</Button>
            </DialogClose>

            <Button onClick={handleClick} variant="destructive">
              {loading ? (
                <Loader2 className="mx-auto animate-spin" />
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteCourse;
