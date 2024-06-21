"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Star } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const ReviewDialog = () => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [reviewDesc, setReviewDesc] = useState("");
  const reviewDescRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/courses/review");
      setLoading(true);
    } catch (error) {
      toast.error("Error while submitting review");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Leave a review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
          <DialogDescription>
            Tell us about your experience with the course. This will help
            instructors to improve the course and other learners to make
            desicion.
          </DialogDescription>
        </DialogHeader>
        <div>
          <h2 className="text-xl font-bold">
            Rating {rating > 0 ? `${rating} / 5` : null}
          </h2>
          <div className="flex items-center gap-3 justify-center">
            {[...Array(5)].map((star, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="rating"
                  hidden
                  value={index + 1}
                  onClick={() => setRating(index + 1)}
                />
                <Star
                  onMouseOver={() => setHoverIndex(index + 1)}
                  onMouseLeave={() => setHoverIndex(-1)}
                  className={cn(
                    index + 1 <= rating && "fill-[#faaf00] ",
                    index + 1 <= hoverIndex && "fill-[#faaf00]",
                    " hover:fill-[#faaf00] "
                  )}
                />
              </label>
            ))}
          </div>

          <textarea
            onChange={(e) => setReviewDesc(e.target.value)}
            className="my-5 border-2 w-full px-3 py-2"
            placeholder="Tell about your learning experience..."
          />
        </div>

        <DialogFooter>
          <Button
            onSubmit={handleSubmit}
            disabled={loading || rating < 1 || reviewDesc.length < 4}
            type="submit"
            variant="app"
          >
            {loading ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              "Add Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
