"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Loader2, Search } from "lucide-react";

const DashboardCourseSearch = ({
  existingSearchTerm,
}: {
  existingSearchTerm: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timer>();
  const [query, setQuery] = useState("");
  const isSearching = !!timeoutId || isPending;
  return (
    <div className="flex w-[600px] items-center rounded-md border-2 border-blue-600 px-5 py-2">
      <input
        type="text"
        className="w-full border-none bg-transparent outline-none"
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
                router.push("/dashboard/courses");
              }
              setTimeoutId(undefined);
            });
          }, 500);

          setTimeoutId(id);
        }}
      />
      <Link href={query ? `/courses?query=${query}` : "#"}>
        {isSearching ? (
          <Loader2 size={25} className="animate-spin text-gray-600" />
        ) : (
          <Search className="cursor-pointer text-blue-600" />
        )}
      </Link>
    </div>
  );
};

export default DashboardCourseSearch;
