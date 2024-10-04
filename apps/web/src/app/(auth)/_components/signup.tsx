"use client";

import Link from "next/link";

const Signup = () => {
  return (
    <>
      <div className="mt-5 flex flex-col items-center justify-center px-3">
        <h1 className="text-3xl font-bold">Sign up</h1>
      </div>
      <div className="mt-10 flex flex-col justify-between gap-2 md:flex-row">
        <div className="flex w-full flex-1 flex-col items-center rounded-r-lg bg-blue-600 px-3 py-5 text-center text-white md:px-6">
          <h2 className="my-2 text-center text-2xl font-bold">
            Student Sign up
          </h2>

          <ul className="mt-3">
            <li>Access to free courses</li>
            <li>Access to premium courses</li>
            <li>Access to discussion</li>
            <li>Measure Progress</li>
          </ul>

          <div className="mt-5 flex items-center justify-center">
            <Link
              href="/signup/student"
              className="rounded-md border-2 px-3 py-3"
            >
              Signup as Student
            </Link>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-center px-3 py-5 text-center md:px-6">
          <h2 className="my-2 text-center text-2xl font-bold">
            Organization Sign up
          </h2>

          <ul className="mt-3">
            <li>Create free courses</li>
            <li>Create paid courses</li>
            <li>Integrated Payment System</li>
            <li>Integrated Analytics </li>
          </ul>

          <div className="mt-5 flex items-center justify-center">
            <Link
              href="/signup/organization"
              className="text-5 rounded-md border-2 bg-blue-600 px-3 py-2 text-white"
            >
              Signup as Organization
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
