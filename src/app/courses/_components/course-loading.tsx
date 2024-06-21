import { Skeleton } from "@/components/ui/skeleton";

const CourseLoading = () => {
  return (
    <div className="grid my-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {Array(9)
        .fill(0)
        .map((_, i) => (
          <div className="w-full p-3 h-[320px] border-2 rounded-md " key={i}>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-3 w-full my-5" />
            <Skeleton className="h-5 w-10 my-1" />
            <Skeleton className="h-5 w-8 my-3" />
          </div>
        ))}
    </div>
  );
};

export default CourseLoading;
