import { Skeleton } from "@/components/ui/skeleton";

const CategoryLoading = () => {
  return (
    <>
      <div className="mb-2 flex items-center gap-x-2 overflow-x-auto pb-2">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex h-[30px] items-center gap-2 rounded-full border-2 px-2 py-1"
            >
              <Skeleton className="w-[30px] rounded-full bg-gray-300" />
              <Skeleton className="h-[20px] w-[100px] rounded-full bg-gray-500" />
            </div>
          ))}
      </div>
    </>
  );
};

export default CategoryLoading;
