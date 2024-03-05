import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { category } from "./category";
import { courseModule } from "./course-modules";
import { courseCategory } from "./course-category";
import { courseMember } from "./course-member";
import { organization, purchase } from ".";

// ! USERID AND ORGANISATIONID ARE NOT FOREIGN KEYS. CHECK FOR ANY ISSUE.

export const course = sqliteTable("course", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),

  organizationId: text("organization_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: integer("price"),
  isPublished: integer("is_published", { mode: "boolean" })
    .default(false)
    .notNull(),
  isFree: integer("is_free", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at"),
});

export const courseRelations = relations(course, ({ many, one }) => ({
  courseCategory: many(courseCategory),
  courseMember: many(courseMember),
  courseModule: many(courseModule),
  organization: one(organization, {
    fields: [course.organizationId],
    references: [organization.id],
  }),
  purchase: many(purchase),
}));

export type Course = typeof course.$inferSelect;
export type NewCourse = typeof course.$inferInsert;
