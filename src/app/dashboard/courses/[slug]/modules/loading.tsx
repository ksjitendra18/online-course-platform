import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section className="w-full px-6 py-3">
      <div className="my-5 flex items-center gap-2">
        <Skeleton className="h-3 w-24 bg-gray-500" />
        &gt;
        <Skeleton className="h-3 w-48 bg-gray-500" />
        &gt;
        <Skeleton className="h-3 w-24 bg-gray-500 underline" />
      </div>

      <div className="flex items-center justify-between gap-x-3 md:justify-start">
        <h1 className="my-3 text-2xl font-bold">Modules</h1>
        <Skeleton className="my-3 flex h-8 w-32 justify-between rounded-md bg-gray-400" />
      </div>

      <div className="flex w-full flex-col items-center justify-center px-4">
        <div className="mx-auto w-[100%]">
          <Skeleton className="my-3 flex h-8 w-full justify-between rounded-md bg-gray-400" />
          <Skeleton className="mb-5 mt-3 h-8 w-full rounded-md bg-gray-400" />
          <Skeleton className="mb-5 mt-3 h-8 w-full rounded-md bg-gray-400" />
          <Skeleton className="mb-5 mt-3 h-8 w-full rounded-md bg-gray-400" />
          <Skeleton className="mb-5 mt-3 h-8 w-full rounded-md bg-gray-400" />
        </div>
      </div>
    </section>
  );
};

export default Loading;
