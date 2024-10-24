import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

const CourseSlugPageLoading = () => {
  return (
    <div className="flex">
      <div className="w-full max-w-sm">
        <div className="m-3 pt-2">
          <div className="flex h-[136px] rounded-md border-2 bg-white">
            <div className="flex w-full flex-col gap-2 pt-5">
              <Skeleton className="mx-auto h-3 w-3/4" />
              <Skeleton className="mx-auto h-3 w-1/2" />
              <Skeleton className="mx-auto mt-10 h-3 w-1/2" />
            </div>
          </div>
        </div>

        <div className="m-3 flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex h-12 rounded-sm border-2 bg-white px-4"
            >
              <Skeleton
                key={index}
                className="my-auto h-3 w-1/2 text-gray-300"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="h-full w-full">
        <div className="mx-auto mt-5 w-full md:px-4">
          <div className="bg-[#213147] px-4 py-5 text-white md:rounded-md md:px-7">
            <Skeleton className="h-3 w-1/2" />

            <div className="flex flex-col gap-2 pt-5">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>

            <div className="mt-5">
              <Skeleton className="h-10 w-12" />
            </div>
            <div className="mt-10 flex gap-4">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-16" />
            </div>

            <div className="mt-8 flex justify-between gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="">
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSlugPageLoading;
