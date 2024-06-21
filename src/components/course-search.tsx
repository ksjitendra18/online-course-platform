"use client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

const CourseSearch = ({
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
        defaultValue={existingSearchTerm}
        // className="bg-transparent border-2 w-[600px] border-[#6320ee] px-5 py-2 rounded-full"
        className="bg-transparent w-full border-none outline-none"
        placeholder="Search Course"
        onChange={(event) => {
          clearTimeout(timeoutId);
          setQuery(event.target.value);
          const id = setTimeout(() => {
            startTransition(() => {
              if (event.target.value) {
                router.push(`/courses?query=${event.target.value}`);
              } else {
                router.push(`/courses`);
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

export default CourseSearch;
