import { redirect } from "next/navigation";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { FaGear } from "react-icons/fa6";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { course } from "@/db/schema";

import CreateNewDiscount from "./create-new-discount";

export const metadata = {
  title: "Discounts",
};

const Discounts = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const courseInfo = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    columns: {
      id: true,
      slug: true,
      title: true,
      price: true,
      description: true,
      isFree: true,
    },
    with: {
      courseDiscount: {
        // columns:{},
        with: {
          discount: {
            columns: {
              id: true,
              code: true,
              type: true,
              discountValue: true,
              isActive: true,
              currentUsage: true,
              usageLimit: true,
              validTill: true,
              activeFrom: true,
            },
          },
        },
      },
    },
  });

  if (!courseInfo) {
    return redirect("/");
  }

  const discounts = courseInfo.courseDiscount.map((data) => data.discount);

  return (
    <>
      <div className="flex items-center justify-between gap-5 p-6 md:justify-start">
        <h1 className="text-2xl font-bold">Discounts </h1>

        <CreateNewDiscount price={courseInfo.price!} courseId={courseInfo.id} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Usage Limit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active From</TableHead>
            <TableHead>Valid Till</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((discount) => (
            <TableRow key={discount.id}>
              <TableCell>{discount.code}</TableCell>
              <TableCell>{discount.type}</TableCell>
              <TableCell>{discount.discountValue}</TableCell>
              <TableCell>{discount.currentUsage}</TableCell>
              <TableCell>{discount.usageLimit ?? "Unlimited"}</TableCell>
              <TableCell>{discount.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                {dayjs(discount.activeFrom).format("DD-MM-YYYY")}{" "}
              </TableCell>
              <TableCell>
                {discount.validTill
                  ? dayjs(discount.validTill * 1000).format("DD-MM-YYYY")
                  : "Unlimited"}{" "}
              </TableCell>

              <TableCell className="text-right">
                {/* {dayjs(enrollment.createdAt * 1000).format("DD-MM-YYYY:HH:mm")}
                
                */}
                <FaGear />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Discounts;
