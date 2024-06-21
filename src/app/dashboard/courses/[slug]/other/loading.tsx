import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <section className="px-6 py-3 w-full">
      <div className="flex items-center  my-5 gap-2">
        <Skeleton className="w-24 h-3 bg-gray-500" />
        &gt;
        <Skeleton className="w-48 h-3 bg-gray-500" />
        &gt;
        <Skeleton className="w-24 underline h-3 bg-gray-500" />
      </div>

      <div className="flex justify-between md:justify-start gap-x-3 items-center">
        <h1 className="text-2xl font-bold my-3">Edit Course Details</h1>
      </div>

      <div className="auth-options w-full px-6 flex flex-col items-center justify-center">
        <div className="w-[100%] mx-auto md:w-3/4 lg:w-1/2">
          <Skeleton className="w-24 h-3 mt-5 bg-gray-400" />
          <Skeleton className="w-full my-3 h-8 rounded-md bg-gray-400" />

          <Skeleton className="w-24 h-3 mt-5 bg-gray-400" />
          <Skeleton className="w-full mt-3 mb-5 h-8 rounded-md bg-gray-400" />

          <Skeleton className="w-24 h-3 mt-5 bg-gray-400" />
          <Skeleton className="w-full mt-3 mb-5 h-8 rounded-md bg-gray-400" />

          <Skeleton className="w-24 h-3 mt-5 bg-gray-400" />
          <Skeleton className="w-full h-44 mt-3 mb-5  rounded-md bg-gray-400" />

          <Skeleton className="w-full h-8 my-5  rounded-md bg-gray-400" />
        </div>
      </div>
    </section>
  );
};

export default Loading;
