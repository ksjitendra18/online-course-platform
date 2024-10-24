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

const ModuleStatus = ({
  // status,
  courseId,
  moduleId,
}: {
  status: "draft" | "published" | "archived" | "deleted";
  courseId: string;
  moduleId: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
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
        toast.success("Module Published Successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("Error while publishing module");
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
              This will publish this module and chapter which has been marked as
              published.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center">
            <DialogClose asChild>
              <Button variant={"ghost"}>Cancel</Button>
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

export default ModuleStatus;
