"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { revalidatePath, revalidateTag } from "next/cache";
import { useRouter } from "next/navigation";
import React, { FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  numberOfReplies: number;
  discussionId: string;
}
const AddNewReply = ({ numberOfReplies, discussionId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [add, setAdd] = useState(false);
  const router = useRouter();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const reply = formData.get("reply");

      // TODO: ADD VALIDATION
      const res = await fetch("/api/discussions/reply", {
        method: "POST",
        body: JSON.stringify({ reply, discussionId }),
      });

      const resData = await res.json();

      if (res.status === 201) {
        router.refresh();
        if (textAreaRef.current) {
          textAreaRef.current.value = "";
        }
        setAdd(false);
      }
    } catch (error) {
      toast.error("Error while adding reply");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="my-5">
      <div className="flex items-center gap-5">
        <h2 className="text-xl font-semibold">{numberOfReplies} Replies</h2>
        <Button
          onClick={() => setAdd((prev) => !prev)}
          className=""
          variant="app"
        >
          {add ? "Cancel" : "Add Reply"}
        </Button>
      </div>
      <div className="my-5">
        {add && (
          <form onSubmit={handleSubmit} className="flex gap-6 items-center">
            <textarea
              name="reply"
              autoFocus
              placeholder="Add a reply..."
              className="border-2 w-full px-3 py-2"
            />
            <Button disabled={loading} className="px-7">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Add"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default AddNewReply;
