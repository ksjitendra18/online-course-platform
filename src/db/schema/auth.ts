import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  blob,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { chapterLogs } from "./chapter";
import { course, courseLogs } from "./course";
import { courseMember } from "./course-member";
import { courseModuleLogs } from "./course-modules";
import { courseProgress } from "./course-progress";
import { discussionReply, discussionVote } from "./discussion";
import { courseEnrollment } from "./enrollment";
import { organizationMember } from "./organization-member";
import { purchase } from "./purchase";

export const organization = sqliteTable("organization", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at")
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
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
  isBlocked: integer("is_blocked", { mode: "boolean" })
    .default(false)
    .notNull(),
  isDeleted: integer("is_deleted", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at")
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
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
  courseLogs: many(courseLogs),
  moduleLogs: many(courseModuleLogs),
  chapterLogs: many(chapterLogs),
  discussionVotes: many(discussionVote),
  discussionReplies: many(discussionReply),
  passwordLogs: many(passwordLogs),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const password = sqliteTable("password", {
  userId: text("user_id")
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .primaryKey(),
  password: text("password").notNull(),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at")
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
});

export const passwordRelations = relations(password, ({ one }) => ({
  user: one(user, {
    fields: [password.userId],
    references: [user.id],
  }),
}));

export const passwordLogs = sqliteTable(
  "password_logs",
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

    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

export const passwordLogsRelations = relations(passwordLogs, ({ one }) => ({
  user: one(user, {
    fields: [passwordLogs.userId],
    references: [user.id],
  }),
}));

export const oauthToken = sqliteTable(
  "oauth_token",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
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
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
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
      .default(sql`(unixepoch())`)
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
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
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
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
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
