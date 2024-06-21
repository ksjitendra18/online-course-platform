"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

const UpvoteBtn = ({
  votes,
  userHasVoted,
  discussionId,
}: {
  votes: number;
  discussionId: string;
  userHasVoted?: boolean;
}) => {
  const router = useRouter();
  const handleUpvote = async () => {
    if (userHasVoted) {
      toast.success("You have already upvoted this");
    }
    const res = await fetch("/api/discussions/upvote", {
      method: "POST",
      body: JSON.stringify({ discussionId }),
    });

    if (res.status === 201) {
      toast.success("Upvoted successfully");
      router.refresh();
    }
  };
  return (
    <Button
      onClick={handleUpvote}
      variant={userHasVoted ? "app" : "outline"}
      className="my-2"
    >
      {votes} Upvotes
    </Button>
  );
};

export default UpvoteBtn;
