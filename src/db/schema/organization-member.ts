import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
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
  role: text("role", { enum: ["owner", "admin", "teacher"] }).notNull(),
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
