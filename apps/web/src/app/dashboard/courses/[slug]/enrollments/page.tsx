import { redirect } from "next/navigation";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, desc, eq, gte, lte, sum } from "drizzle-orm";

import { DataCard } from "@/app/dashboard/(main)/analytics/_components/data-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { course, courseEnrollment, purchase } from "@/db/schema";
import { cn } from "@/lib/utils";

dayjs.extend(utc);
export const metadata = {
  title: "Enrollments",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const Enrollments = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const courseData = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    columns: { id: true, isFree: true },
    with: {
      enrollment: {
        orderBy: desc(courseEnrollment.createdAt),
        columns: { id: true, createdAt: true },
        with: {
          user: {
            columns: { email: true, name: true },
          },
        },
      },
      purchase: {
        columns: {
          id: true,
          razorpayPaymentId: true,
          coursePrice: true,
          createdAt: true,
          razorpayOrderId: true,
        },
        orderBy: desc(purchase.createdAt),
        with: {
          user: {
            columns: { email: true, name: true },
          },
        },
      },
    },
  });

  if (!courseData) {
    return redirect("/dashboard");
  }

  const gmtDate = dayjs().utc().startOf("day").unix();

  const nextGmtDate = dayjs().utc().startOf("day").add(1, "day").unix();

  const todayEnrollment = await db.$count(
    courseEnrollment,
    and(
      eq(courseEnrollment.courseId, courseData.id),
      lte(courseEnrollment.createdAt, nextGmtDate),
      gte(courseEnrollment.createdAt, gmtDate)
    )
  );
  const totalEarning = await db
    .select({
      earning: sum(purchase.coursePrice),
    })
    .from(purchase)
    .where(eq(purchase.courseId, courseData.id));

  console.log("enrollments", courseData);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Enrollments </h1>

      <div
        className={cn(
          courseData.isFree ? "md:grid-cols-2" : "md:grid-cols-3",
          "my-4 grid grid-cols-1 gap-4"
        )}
      >
        <DataCard label="Today Enrollments" value={todayEnrollment} />
        <DataCard
          label="All Enrollments"
          value={courseData.enrollment.length}
        />
        {!courseData.isFree && (
          <DataCard
            label="Total Earning"
            shouldFormat
            value={Number(totalEarning[0].earning)}
          />
        )}
      </div>

      {courseData.enrollment.length > 0 && (
        <div className="my-5 rounded-md border-2 bg-white">
          {courseData.isFree ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Enrolled At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseData.enrollment.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>{enrollment.user.name}</TableCell>
                    <TableCell>{enrollment.user.email}</TableCell>

                    <TableCell className="text-right">
                      {dayjs(enrollment.createdAt * 1000).format(
                        "DD-MM-YYYY:HH:mm"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Payment ID</TableHead>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Enrolled At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseData.purchase.map((coursePurchase) => (
                  <TableRow key={coursePurchase.id}>
                    <TableCell className="font-medium">
                      {coursePurchase.razorpayPaymentId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {coursePurchase.razorpayOrderId}
                    </TableCell>
                    <TableCell>{coursePurchase.user.name}</TableCell>
                    <TableCell>{coursePurchase.user.email}</TableCell>
                    <TableCell>{coursePurchase.coursePrice}</TableCell>
                    <TableCell className="text-right">
                      {dayjs(coursePurchase.createdAt * 1000).format(
                        "DD-MM-YYYY:HH:mm"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

export default Enrollments;
