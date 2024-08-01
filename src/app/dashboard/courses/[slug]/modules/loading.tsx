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
        <h1 className="text-2xl font-bold my-3">Modules</h1>
        <Skeleton className="w-32 my-3 h-8 rounded-md bg-gray-400 flex justify-between" />
      </div>

      <div className=" w-full px-4 flex flex-col items-center justify-center">
        <div className="w-[100%] mx-auto ">
          <Skeleton className="w-full my-3 h-8 rounded-md bg-gray-400 flex justify-between" />
          <Skeleton className="w-full mt-3 mb-5 h-8 rounded-md bg-gray-400" />
          <Skeleton className="w-full mt-3 mb-5 h-8 rounded-md bg-gray-400" />
          <Skeleton className="w-full mt-3 mb-5 h-8 rounded-md bg-gray-400" />
          <Skeleton className="w-full mt-3 mb-5 h-8 rounded-md bg-gray-400" />
        </div>
      </div>
    </section>
  );
};

export default Loading;
