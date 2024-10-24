import { Skeleton } from "@/components/ui/skeleton";

const CourseLoading = ({ length }: { length?: number }) => {
  return (
    <div className="my-5 grid gap-4 p-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {Array(length ?? 3)
        .fill(0)
        .map((_, i) => (
          <div
            className="h-[320px] w-full rounded-md border-2 border-gray-200 p-3"
            key={i}
          >
            <Skeleton className="h-40 w-full" />
            <Skeleton className="my-5 h-3 w-full" />
            <Skeleton className="my-1 h-5 w-10" />
            <Skeleton className="my-3 h-5 w-8" />
          </div>
        ))}
    </div>
  );
};

export default CourseLoading;
