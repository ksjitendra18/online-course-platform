import { Skeleton } from "@/components/ui/skeleton";

const CategoryLoading = () => {
  return (
    <>
      <div className="flex mb-2  items-center gap-x-2 overflow-x-auto pb-2">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex  gap-2 px-2 py-1 h-[30px] items-center rounded-full border-2 "
            >
              <Skeleton className="w-[30px] bg-gray-300 rounded-full" />
              <Skeleton className="w-[100px] h-[20px] bg-gray-500 rounded-full " />
            </div>
          ))}
      </div>
    </>
  );
};

export default CategoryLoading;
