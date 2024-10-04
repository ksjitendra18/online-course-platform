"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FcGoogle } from "react-icons/fc";

import OrganizationSignupForm from "./organization-signup-form";

const OrganizationSignup = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <div className="mt-5 flex flex-col items-center justify-center px-3">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <div className="flex w-full flex-col items-center justify-center">
        <button
          onClick={() => {
            setLoading(true);
            router.push(loading ? "#" : "/api/auth/google?type=organization");
          }}
          className="mt-5 flex w-full max-w-full items-center justify-center rounded-md bg-black px-6 py-2 text-white transition-all duration-75 ease-in-out hover:scale-95 md:w-3/4 lg:w-1/3"
        >
          <span className="mr-2">
            <FcGoogle className="h-8 w-8" />
          </span>
          Sign up with Google
        </button>

        <div className="mb-3 mt-5 flex w-full items-center justify-center md:w-3/4 lg:w-1/3">
          <div className="before-or mr-2 h-[2px] w-[100%] bg-gray-300"></div>
          <p className="or text-gray-500">OR</p>
          <div className="after-or ml-2 h-[2px] w-[100%] bg-gray-300"></div>
        </div>

        <OrganizationSignupForm loading={loading} setLoading={setLoading} />
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

export default OrganizationSignup;
