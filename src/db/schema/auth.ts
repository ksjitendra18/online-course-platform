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
import { courseEnrollment } from "./enrollment";
import { courseProgress } from "./course-progress";

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
  isBlocked: integer("is_blocked", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const userRelations = relations(user, ({ one, many }) => ({
  session: many(session),
  oauthToken: many(oauthToken),
  password: one(password),
  courseMember: many(courseMember),
  organizationMember: many(organizationMember),
  purchase: many(purchase),
  loginLog: many(loginLog),
  enrollment: many(courseEnrollment),
  progress: many(courseProgress),
}));

export const password = sqliteTable("password", {
  userId: text("user_id")
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .primaryKey(),
  password: text("password").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const passwordRelations = relations(password, ({ one }) => ({
  user: one(user, {
    fields: [password.userId],
    references: [user.id],
  }),
}));

export const oauthToken = sqliteTable(
  "oauth_token",
  {
    id: text("id").$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    strategy: text("strategy", { enum: ["google", "github"] }).notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    oauthUIdIdx: index("oauth_uid_idx").on(table.userId),
  })
);

export const oauthTokenRelations = relations(oauthToken, ({ one }) => ({
  user: one(user, {
    fields: [oauthToken.userId],
    references: [user.id],
  }),
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
        onUpdate: "cascade",
      }),
    active: integer("active", { mode: "boolean" }).default(true),
    expiresAt: blob("expires_at", { mode: "bigint" }).notNull(),
    userIp: text("user_ip").notNull(),
    deviceId: text("device_id").notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
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
  loginLog: one(loginLog),
}));

export const loginLog = sqliteTable("login_log", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  sessionId: text("session_id").references(() => session.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  userId: text("user_id").references(() => user.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  browser: text("browser").notNull(),
  device: text("device").notNull(),
  os: text("os").notNull(),
  ip: text("ip").notNull(),
  loggedInAt: text("logged_in_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const loginLogRelations = relations(loginLog, ({ one }) => ({
  user: one(user, {
    fields: [loginLog.userId],
    references: [user.id],
  }),
  session: one(session, {
    fields: [loginLog.sessionId],
    references: [session.id],
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
    sessionId: text("session_id").references(() => session.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
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
