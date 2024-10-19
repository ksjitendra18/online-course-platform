import { and, eq, isNull, lte, or } from "drizzle-orm";

import { db } from "../index";
import { course, courseDiscount, discount } from "../schema";

interface DiscountDataProps {
  code?: string;
  courseId: string;
}

export const getDiscountedPrice = async ({
  code,
  courseId,
}: DiscountDataProps) => {
  let courseData:
    | {
        price: number | null;
      }
    | undefined;
  try {
    courseData = await db.query.course.findFirst({
      columns: { price: true },
      where: eq(course.id, courseId),
    });
    if (!courseData) {
      throw new Error("Course not found");
    } else if (!courseData.price) {
      throw new Error("Course price not found");
    }

    let newPrice = courseData.price;

    if (!code) {
      return { newPrice: courseData.price, discountData: null };
    } else {
      const currentTimestamp = Math.floor(Date.now());

      const [discountData] = await db
        .select({
          id: discount.id,
          code: discount.code,
          discountValue: discount.discountValue,
          type: discount.type,
          isGlobal: discount.isGlobal,
        })
        .from(discount)
        .leftJoin(courseDiscount, eq(discount.id, courseDiscount.discountId))
        .where(
          and(
            eq(discount.code, code),
            eq(discount.isActive, true),
            or(
              eq(discount.isGlobal, true),
              eq(courseDiscount.courseId, courseId)
            ),
            lte(discount.activeFrom, currentTimestamp),
            or(
              isNull(discount.validTill),
              lte(discount.validTill, currentTimestamp)
            )
          )
        );

      if (discountData) {
        if (discountData.type === "value") {
          newPrice = discountData.discountValue;
        } else {
          newPrice = Math.floor(
            courseData.price! * (1 - discountData.discountValue / 100)
          );
        }
      }
      return { newPrice, discountData };
    }
  } catch (error) {
    console.log("error while getting discount data", error);
    throw new Error("Error while fetching discount data");
  }
};
