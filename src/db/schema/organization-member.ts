import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { course } from "./course";
import { organization, user } from "./auth";

export const organizationMember = sqliteTable("organization_member", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  isBlocked: integer("is_blocked", { mode: "boolean" })
    .default(false)
    .notNull(),
  role: text("role", { enum: ["owner", "admin", "teacher"] }).notNull(),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const organizationToUserRelations = relations(
  organizationMember,
  ({ one }) => ({
    user: one(user, {
      fields: [organizationMember.userId],
      references: [user.id],
    }),
    organization: one(organization, {
      fields: [organizationMember.organizationId],
      references: [organization.id],
    }),
  })
);
