"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const VerifyMagicLink = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function verifyMagicLink() {
    try {
      const res = await fetch("/api/auth/magic-link/verify", {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      const resData = await res.json();

      if (res.status === 200) {
        setSuccess(true);
        router.push("/");
        router.refresh();
      } else if (res.status === 302) {
        router.push(resData.redirect);
        router.refresh();
        return;
      } else {
        setError(resData.error.message);
        toast.error(resData.error.message);
      }
    } catch (error) {
      setError("Error while login. Please try again later");
      toast.error("Error while login. Please try again later");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    verifyMagicLink();
  }, []);
  return (
    <div>
      {loading && (
        <div className="my-20 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin rounded-full" />
          Verifying magic link...
        </div>
      )}

      {success && (
        <div className="my-20 flex items-center justify-center">
          <p className="rounded-md bg-green-700 px-4 py-2 text-white">
            Logged in successfully. Redirecting...
          </p>
        </div>
      )}

      {error && (
        <div className="my-20 flex items-center justify-center">
          <p className="rounded-md bg-red-700 px-4 py-2 text-white">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyMagicLink;
