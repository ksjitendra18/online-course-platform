"use client";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
        router.push("/dashboard");
        router.refresh();
      } else if (res.status === 302) {
        router.push(resData.redirect);
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
        <div className="my-20 flex justify-center items-center">
          <Loader2 className="animate-spin h-10 w-10  rounded-full" />
          Verifying magic link...
        </div>
      )}

      {success && (
        <div className="my-20 flex justify-center items-center">
          <p className="bg-green-700 text-white rounded-md px-4 py-2 ">
            Logged in successfully. Redirecting...
          </p>
        </div>
      )}

      {error && (
        <div className="my-20 flex justify-center items-center">
          <p className="bg-red-700 text-white rounded-md px-4 py-2 ">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyMagicLink;
