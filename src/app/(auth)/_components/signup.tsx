"use client";

import Link from "next/link";
import { useState } from "react";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <div className="flex mt-5 px-3 items-center justify-center flex-col">
        <h1 className="text-3xl font-bold">Sign up</h1>
      </div>
      <div className="flex mt-10 gap-2 flex-col md:flex-row  justify-between">
        <div className="flex-1 w-full bg-blue-600 text-white   rounded-r-lg flex flex-col items-center text-center px-3 md:px-6 py-5">
          <h2 className="text-center text-2xl font-bold my-2">
            Student Sign up
          </h2>

          <ul className=" mt-3">
            <li>Access to free courses</li>
            <li>Access to premium courses</li>
            <li>Access to discussion</li>
            <li>Measure Progress</li>
          </ul>

          <div className="flex mt-5 items-center justify-center">
            <Link
              href="/signup/student"
              className="border-2 rounded-md px-3  py-3"
            >
              Signup as Student
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col items-center  text-center px-3 md:px-6 py-5">
          <h2 className="text-center text-2xl font-bold my-2">
            Organization Sign up
          </h2>

          <ul className=" mt-3">
            <li>Create free courses</li>
            <li>Create paid courses</li>
            <li>Integrated Payment System</li>
            <li>Integrated Analytics </li>
          </ul>

          <div className="flex mt-5 items-center justify-center">
            <Link
              href="/signup/organization"
              className="border-2 text-white bg-blue-600 text-5 rounded-md px-3  py-2"
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
