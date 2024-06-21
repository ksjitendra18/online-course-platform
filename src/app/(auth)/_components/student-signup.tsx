"use client";

import React, { useState } from "react";
import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import StudentSignupForm from "./student-signup-form";
import Link from "next/link";
import toast from "react-hot-toast";

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
    <div className="flex mt-5 px-3 items-center justify-center flex-col">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <div className="flex w-full flex-col items-center justify-center">
        <Link
          href={loading ? `#` : "/api/auth/google"}
          onClick={() => {
            handleLinkClick();
          }}
          className="px-6 py-2 w-full max-w-full md:w-3/4 lg:w-1/3 flex items-center justify-center rounded-md mt-5 border-blue-600 border-2 hover:scale-95 transition-all ease-in-out duration-75"
        >
          <span className="mr-2">
            <FcGoogle className="w-8 h-8" />
          </span>
          Sign up with Google
        </Link>

        <div className="mt-5 mb-3 w-full md:w-3/4 lg:w-1/3 flex items-center justify-center">
          <div className="before-or w-[100%] h-[2px] bg-gray-300 mr-2"></div>
          <p className="text-gray-500 or">OR</p>
          <div className="after-or w-[100%] h-[2px] bg-gray-300 ml-2"></div>
        </div>

        <StudentSignupForm loading={loading} setLoading={setLoading} />
      </div>
      <p className="text-center my-5">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-700">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default StudentSignup;
