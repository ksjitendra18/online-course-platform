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

const DeleteModule = ({
  moduleId,
  courseId,
}: {
  moduleId: string;
  courseId: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        setOpen(false);
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
      <Dialog open={open} onOpenChange={setOpen}>
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
              <Button>Cancel</Button>
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

export default DeleteModule;
