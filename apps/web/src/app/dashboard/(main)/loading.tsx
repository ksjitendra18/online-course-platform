import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Dashboard",
};

const DashboardLoadingPage = async () => {
  return (
    <section className="p-6">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-card text-card-foreground flex h-[110px] flex-col rounded-lg border bg-white shadow-sm"
          >
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <Skeleton className="mt-2 h-3 w-3/4 bg-gray-500" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="mt-3 h-6 w-12 bg-gray-500" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DashboardLoadingPage;
