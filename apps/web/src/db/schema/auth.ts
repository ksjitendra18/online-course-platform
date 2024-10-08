import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  avatar: text("avatar"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" })
    .default(false)
    .notNull(),
  twoFactorSecret: text("two_factor_secret"),
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
  oauthProvider: many(oauthProvider),
  adminAuthLogs: many(adminAuthLogs),
  recoveryCodes: many(recoveryCodes),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const oauthProvider = sqliteTable(
  "oauth_provider",
  {
    id: text("id")
      .$default(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    provider: text("provider", { enum: ["google"] }).notNull(),
    providerUserId: text("provider_user_id").notNull(),
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at")
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    oauthProviderUserIdIdx: index("oauth_provider_user_id_idx").on(
      table.userId
    ),
    oauthProviderProviderIdIdx: index("oauth_provider_user_id_idx").on(
      table.providerUserId
    ),
  })
);

export const oauthProviderRelations = relations(oauthProvider, ({ one }) => ({
  user: one(user, {
    fields: [oauthProvider.userId],
    references: [user.id],
  }),
}));

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
    expiresAt: integer("expires_at").notNull(),
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

  strategy: text("strategy", {
    enum: ["google", "credentials", "magic_link"],
  }).notNull(),

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

export const recoveryCodes = sqliteTable("recovery_codes", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  code: text("code").notNull(),
  isUsed: integer("is_used", { mode: "boolean" }).default(false),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const recoveryCodesRelations = relations(recoveryCodes, ({ one }) => ({
  user: one(user, {
    fields: [recoveryCodes.userId],
    references: [user.id],
  }),
}));

export const adminAuthLogs = sqliteTable("admin_auth_logs", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  userInfo: text("user_info").notNull(),
  action: text("action").notNull(),
  browser: text("browser").notNull(),
  device: text("device").notNull(),
  os: text("os").notNull(),
  ip: text("ip").notNull(),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const adminAuthLogsRelations = relations(adminAuthLogs, ({ one }) => ({
  user: one(user, {
    fields: [adminAuthLogs.userId],
    references: [user.id],
  }),
}));
