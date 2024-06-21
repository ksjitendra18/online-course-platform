"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CourseSearch from "./course-search";

const Navbar = ({
  currentUser,
}: {
  currentUser:
    | {
        userId: string;
        name: string;
        email: string;
        role: string;
        staff: boolean;
      }
    | null
    | undefined;
}) => {
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    router.push("/");
    router.refresh();
  };

  const searchParams = useSearchParams();

  const existingSearchTerm = searchParams.get("query");

  // console.log("navbar", currentUser);
  return (
    <>
      <header className="relative text-black bg-white  h-[80px]">
        <div className="h-full  mx-auto flex justify-between items-center py-2 px-3 md:px-6">
          <Link
            onClick={() => setMobileNavActive(false)}
            href="/"
            className="font-bold text-2xl px-3 md:px-0"
          >
            Learning App
          </Link>

          <CourseSearch existingSearchTerm={existingSearchTerm ?? ""} />
          <nav
            className={cn(
              mobileNavActive ? "flex" : "hidden",
              "z-30 md:flex absolute md:static left-0 top-16 duration-300 ease-in transition-all md:top-0 items-center w-full md:w-auto justify-center bg-[#1f2023] md:bg-transparent text-white md:text-black"
            )}
          >
            <ul className="flex flex-col md:flex-row text-xl py-5 md:py-3 justify-center items-center gap-5">
              <li onClick={() => setMobileNavActive(false)}>
                <Link href="/">Home</Link>
              </li>

              <li onClick={() => setMobileNavActive(false)}>
                <Link href="/courses">Courses</Link>
              </li>
              {currentUser ? (
                <>
                  {currentUser.staff && (
                    <li onClick={() => setMobileNavActive(false)}>
                      <Link href="/dashboard">Dashboard</Link>
                    </li>
                  )}

                  {!currentUser.staff && (
                    <>
                      <li onClick={() => setMobileNavActive(false)}>
                        <Link href="/my-courses">My Courses</Link>
                      </li>
                    </>
                  )}

                  <li onClick={() => setMobileNavActive(false)}>
                    <Link href="/profile">Profile</Link>
                  </li>

                  <button
                    className="bg-blue-600 px-4 py-2 text-white rounded-md "
                    onClick={() => handleLogout()}
                  >
                    <p>Logout</p>
                  </button>
                </>
              ) : (
                <li onClick={() => setMobileNavActive(false)}>
                  <Link href="/login">Login</Link>
                </li>
              )}
            </ul>
          </nav>
          <div
            onClick={() => setMobileNavActive((prev) => !prev)}
            className={cn(
              mobileNavActive && "active",
              "px-3 hamburger  block md:hidden mt-1 cursor-pointer"
            )}
          >
            <span className="bar block w-[30px] h-[4px] bg-black"></span>
            <span className="bar block w-[30px] mt-1 h-[4px] bg-black"></span>
            <span className="bar block w-[30px] mt-1 h-[4px] bg-black"></span>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
