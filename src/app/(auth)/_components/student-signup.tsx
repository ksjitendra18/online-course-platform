"use client";

import Link from "next/link";
import { useState } from "react";

import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

import StudentSignupForm from "./student-signup-form";

const StudentSignup = () => {
  const [loading, setLoading] = useState(false);
  const handleLinkClick = () => {
    if (loading) {
      toast.error(
        "Login already in progress.You can't perform this function right now."
      );
    } else {
      setLoading(true);
    }
  };
  return (
    <div className="mt-5 flex flex-col items-center justify-center px-3">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <div className="flex w-full flex-col items-center justify-center">
        <Link
          href={loading ? "#" : "/api/auth/google"}
          onClick={() => {
            handleLinkClick();
          }}
          className="mt-5 flex w-full max-w-full items-center justify-center rounded-md border-2 border-blue-600 px-6 py-2 transition-all duration-75 ease-in-out hover:scale-95 md:w-3/4 lg:w-1/3"
        >
          <span className="mr-2">
            <FcGoogle className="h-8 w-8" />
          </span>
          Sign up with Google
        </Link>

        <div className="mb-3 mt-5 flex w-full items-center justify-center md:w-3/4 lg:w-1/3">
          <div className="before-or mr-2 h-[2px] w-[100%] bg-gray-300"></div>
          <p className="or text-gray-500">OR</p>
          <div className="after-or ml-2 h-[2px] w-[100%] bg-gray-300"></div>
        </div>

        <StudentSignupForm loading={loading} setLoading={setLoading} />
      </div>
      <p className="my-5 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-700">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default StudentSignup;
