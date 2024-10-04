"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

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
          <form onSubmit={handleSubmit} className="flex items-center gap-6">
            <textarea
              name="reply"
              autoFocus
              placeholder="Add a reply..."
              className="w-full border-2 px-3 py-2"
            />
            <Button disabled={loading} className="px-7">
              {loading ? <Loader2 className="mx-auto animate-spin" /> : "Add"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default AddNewReply;
