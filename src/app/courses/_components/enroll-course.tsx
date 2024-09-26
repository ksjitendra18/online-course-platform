"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

const EnrollCourse = ({
  courseId,
  isFree,
  price,
}: {
  courseId: string;
  isFree: boolean;
  price: number;
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const enrollToCourse = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/enroll", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      });

      if (res.status === 201) {
        toast.success("Enrolled into Course Successfully");
        router.refresh();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {
        <Button variant="app" onClick={enrollToCourse} disabled={loading}>
          {loading ? (
            <Loader2 className="mx-auto animate-spin" />
          ) : (
            "Enroll to Course"
          )}
        </Button>
      }
    </>
  );
};

export default EnrollCourse;
