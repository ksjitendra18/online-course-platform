"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { mutate } from "swr";

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

const DeleteQuiz = ({
  quizId,
  questionId,
}: {
  quizId: string;
  questionId: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClick = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/chapters/quiz/${quizId}/${questionId}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        mutate("questions");
        toast.success("Chapter Deleted Successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("Error while deleting chapter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              Once deleted, the data can&apos;t be recovered!
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

export default DeleteQuiz;
