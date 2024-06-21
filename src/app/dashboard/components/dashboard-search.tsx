"use client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

const DashboardCourseSearch = ({
  existingSearchTerm,
}: {
  existingSearchTerm: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const [query, setQuery] = useState("");
  const isSearching = timeoutId || isPending;
  return (
    <div className="border-2 flex items-center w-[600px] border-blue-600 px-5 py-2 rounded-md">
      <input
        type="text"
        className="bg-transparent w-full border-none outline-none"
        placeholder="Search Course"
        defaultValue={existingSearchTerm}
        onChange={(event) => {
          clearTimeout(timeoutId);
          setQuery(event.target.value);
          const id = setTimeout(() => {
            startTransition(() => {
              if (event.target.value) {
                router.push(
                  `/dashboard/courses?courseName=${event.target.value}`
                );
              } else {
                router.push(`/dashboard/courses`);
              }
              setTimeoutId(undefined);
            });
          }, 500);

          setTimeoutId(id);
        }}
      />
      <Link href={query ? `/courses?query=${query}` : "#"}>
        <Search className="text-blue-600 cursor-pointer" />
      </Link>
    </div>
  );
};

export default DashboardCourseSearch;
