import { db } from "@/db";
import { Course, Purchase, courseMember, purchase } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

type PurchaseWithCourse = Pick<Purchase, "coursePrice"> & {
  course: Pick<Course, "title" | "price">;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};

  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }

    grouped[courseTitle] += purchase.coursePrice;
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    const allPurchasedCourses = await db.query.purchase.findMany({
      columns: {
        coursePrice: true,
      },
      where: inArray(
        purchase.courseId,
        db
          .select({ id: courseMember.courseId })
          .from(courseMember)
          .where(eq(courseMember.userId, userId))
      ),
      with: {
        course: {
          columns: {
            title: true,
            price: true,
          },
        },
      },
    });

    const groupedEarnings = groupByCourse(allPurchasedCourses);
    const data = Object.entries(groupedEarnings).map(
      ([courseTitle, total]) => ({
        name: courseTitle,
        total: total,
      })
    );

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = allPurchasedCourses.length;

    return {
      data,
      totalRevenue,
      totalSales,
    };
  } catch (error) {
    console.log("Error in analytics", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};
