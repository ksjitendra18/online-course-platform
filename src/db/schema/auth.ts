import { relations, sql } from "drizzle-orm";
import {
  blob,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { courseMember } from "./course-member";
import { organizationMember } from "./organization-member";
import { course } from "./course";
import { purchase } from "./purchase";

export const organization = sqliteTable("organization", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const organizationRelations = relations(organization, ({ many }) => ({
  organizationMember: many(organizationMember),
  courses: many(course),
}));

export const user = sqliteTable("user", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  userName: text("user_name").notNull().unique(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  password: text("password").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at"),
});

export const usersRelations = relations(user, ({ many }) => ({
  session: many(session),
  courseMember: many(courseMember),
  organizationMember: many(organizationMember),
  purchase: many(purchase),
}));

export const session = sqliteTable(
  "session",
  {
    id: text("id")
      .$default(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    active: integer("active", { mode: "boolean" }).default(true),
    expiresAt: blob("expires_at", { mode: "bigint" }).notNull(),
    userIp: text("user_ip").notNull(),
    deviceId: text("device_id").notNull(),
  },
  (table) => {
    return {
      userIdSessIdx: index("user_id_sess_idx").on(table.userId),
    };
  }
);

export const sessRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const device = sqliteTable(
  "device",
  {
    id: text("id")
      .$default(() => createId())
      .primaryKey(),
    deviceFingerPrint: text("device_fingerprint").notNull(),
    os: text("os").notNull(),
    browser: text("browser").notNull(),
    userIp: text("user_ip").notNull(),
    lastActive: integer("last_active").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    loggedIn: integer("logged_in", { mode: "boolean" }).notNull(),
    sessionId: text("session_id")
      .notNull()
      .references(() => session.id, {
        onDelete: "set null",
      }),
  },
  (table) => {
    return {
      sessionIdIdx: uniqueIndex("device_sess_id_idx").on(table.sessionId),
    };
  }
);

export const deviceSessRelations = relations(device, ({ one }) => ({
  device: one(session, {
    fields: [device.sessionId],
    references: [session.id],
  }),
}));

export type User = typeof user.$inferSelect; // return type when queried
export type NewUser = typeof user.$inferInsert;
