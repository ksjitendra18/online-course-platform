import { cookies } from "next/headers";

import { hash } from "@node-rs/argon2";
import { xxh32, xxh64 } from "@node-rs/xxhash";
import Bowser from "bowser";
import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import { db } from "@/db";
import {
  courseMember,
  loginLog,
  oauthProvider,
  password,
  session,
  user,
} from "@/db/schema";
import { env } from "@/utils/env/server";

import { EncryptionPurpose, aesDecrypt } from "./aes";
import redis from "./redis";

type NewUserArgs = {
  email: string;
  userName: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  trx?: typeof db;
};

type UserExistArgs = {
  email: string;
  strategy: "google";
};

type NewSessionArgs = {
  userId: string;
};

type NewLogsArgs = {
  userAgent: string | null;
  userId: string;
  sessionId: string;
  ip: string;
  strategy: "google" | "credentials" | "magic_link";
};

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 14);

export const createUser = async ({
  email,
  name,
  avatar,
  userName,
  emailVerified,
  trx = db,
}: NewUserArgs) => {
  try {
    const newUser = await trx
      .insert(user)
      .values({
        name,
        userName,
        email,
        emailVerified,
        avatar,
      })
      .returning({ id: user.id });

    return { userId: newUser[0].id };
  } catch (error) {
    console.log("error while creating user", error);
    throw new Error("Error while creating user");
  }
};

export const checkUserExists = async ({ email }: UserExistArgs) => {
  const userExists = await db.query.user.findFirst({
    where: and(
      eq(user.email, email),
      eq(user.isBlocked, false),
      eq(user.isDeleted, false)
    ),
    with: {
      oauthProvider: true,
    },
  });

  return userExists;
};

export const checkOauthUserExists = async ({
  providerId,
  email,
  strategy,
}: {
  providerId: string;
  email: string;
  strategy: "google";
}) => {
  const userExists = await db.query.user.findFirst({
    where: and(
      eq(user.email, email),
      eq(user.isDeleted, false),
      eq(user.isBlocked, false),
      eq(user.isDeleted, false)
    ),
    columns: { id: true, twoFactorEnabled: true },
    with: {
      oauthProvider: {
        where: and(
          eq(oauthProvider.provider, strategy),
          eq(oauthProvider.providerUserId, String(providerId))
        ),
      },
    },
  });

  return userExists;
};

export const createOauthProvider = async ({
  providerId,
  userId,
  strategy,
  trx = db,
}: {
  providerId: string | number;
  userId: string;
  strategy: "google";
  trx?: typeof db;
}) => {
  try {
    await trx.insert(oauthProvider).values({
      providerUserId: String(providerId),
      userId,
      provider: strategy,
    });
  } catch (error) {
    console.log("error while creating oauth provider", error);
    throw new Error("Error while creating oauth provider");
  }
};

export const createSession = async ({ userId }: NewSessionArgs) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const newSession = await db
      .insert(session)
      .values({
        userId,
        expiresAt: expiresAt.getTime(),
      })
      .returning({ id: session.id });

    return { sessionId: newSession[0].id, expiresAt };
  } catch (error) {
    console.log("error while creating session", error);
    throw new Error("Failed to create session");
  }
};

export const createLoginLog = async ({
  userAgent,
  userId,
  sessionId,
  ip,
  strategy,
}: NewLogsArgs) => {
  if (!userAgent) {
    throw new Error("Internal Error");
  }
  const parser = Bowser.getParser(userAgent);

  try {
    await db.insert(loginLog).values({
      userId,
      sessionId,
      ip,
      strategy,
      os: `${parser.getOSName()} ${parser.getOSVersion()}`,
      browser: `${parser.getBrowserName()} ${parser.getBrowserVersion()}`,
      device: parser.getPlatformType(),
    });
  } catch (error) {
    console.log("Failed to create logs", error);
    throw new Error("Failed to create logs");
  }
};

export const hashPassword = async ({
  password: enteredPassword,
}: {
  password: string;
}) => {
  try {
    const hashedPassword = await hash(enteredPassword, {
      memoryCost: 2 ** 16,
      timeCost: 5,
      parallelism: 2,
    });
    return hashedPassword;
  } catch (error) {
    console.log("Error while creating password ", error);
    throw new Error("Error while creating password");
  }
};
export const createPassword = async ({
  password: enteredPassword,
  userId,
}: {
  password: string;
  userId: string;
}) => {
  try {
    // const hashedPassword = await bcrypt.hash(enteredPassword, 10);
    const hashedPassword = await hash(enteredPassword, {
      memoryCost: 2 ** 16,
      timeCost: 5,
      parallelism: 2,
    });
    await db.insert(password).values({
      userId,
      password: hashedPassword,
    });
  } catch (error) {
    console.log("Error while creating password ", error);
    throw new Error("Error while creating password");
  }
};

const generateTokenId = customAlphabet("0123456789", 6);
const generateVerificationId = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  64
);

export const sendVerificationMail = async ({ email }: { email: string }) => {
  const token = generateTokenId();
  const verificationId = generateVerificationId(64);

  try {
    const lastEmailSentTime: string | null = await redis.get(`${email}:sent`);

    if (lastEmailSentTime) {
      return {
        waitTime:
          10 -
          Math.floor(
            (new Date().getTime() - Number(lastEmailSentTime)) / 60000
          ),
      };
    }

    const emailSentCount: string | null = await redis.get(`${email}:count`);

    if (emailSentCount == null || Number(emailSentCount) > 0) {
      const res = await fetch("https://api.zeptomail.in/v1.1/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${env.ZOHO_MAIL_TOKEN}`,
        },
        // to: email,
        body: JSON.stringify({
          from: {
            name: `${env.FROM_NAME}`,
            address: `${env.AUTH_EMAIL_ADDRESS}`,
          },
          to: [
            {
              email_address: {
                address: email,
              },
            },
          ],
          subject: `${token} is your email verification code`,
          htmlbody: `<div>The code for verification is ${token} </div>
          <div>The code is valid for only 1 hour</div>
          <div>You have received this email because you or someone tried to signup on the website </div>
          <div>If you didn't signup, kindly ignore this email.</div>
          <div>For support contact us at support[at]learningapp.link</div>
          `,
        }),
      });

      if (res.ok) {
        const hashedVerificationId = xxh64(verificationId).toString(16);

        const verificationIdPromise = redis.set(
          hashedVerificationId,
          `${token}:${email}`,
          "EX",
          3600
        );

        let emailCountPromise;

        if (emailSentCount === null) {
          emailCountPromise = redis.set(`${email}:count`, 4, "EX", 86400);
        } else {
          emailCountPromise = redis.decr(`${email}:count`);
        }

        const emailSentPromise = redis.set(
          `${email}:sent`,
          new Date().getTime(),
          "EX",
          600
        );

        const [res1, res2, res3] = await Promise.all([
          verificationIdPromise,
          emailCountPromise,
          emailSentPromise,
        ]);

        if (res1 && res2 && res3) {
          return { verificationId };
        } else {
          throw new Error("Error while sending mail");
        }
      } else {
        throw new Error("Error while sending mail");
      }
    } else {
      return { emailSendLimit: true };
    }
  } catch (error) {
    console.log("error while sending verification mail", error);
    throw new Error("Error while sending verification mail");
  }
};

export const sendPasswordResetMail = async ({
  email,
  url,
}: {
  email: string;
  url: string;
}) => {
  const verificationId = generateVerificationId();

  try {
    const lastEmailSentTime: string | null = await redis.get(
      `${email}:pwd_reset_sent`
    );

    if (lastEmailSentTime) {
      return {
        waitTime:
          10 -
          Math.floor(
            (new Date().getTime() - Number(lastEmailSentTime)) / 60000
          ),
      };
    }

    const emailSentCount: string | null = await redis.get(
      `${email}:pwd_reset_count`
    );

    if (emailSentCount == null || Number(emailSentCount) > 0) {
      const res = await fetch("https://api.zeptomail.in/v1.1/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${env.ZOHO_MAIL_TOKEN}`,
        },
        body: JSON.stringify({
          from: {
            name: `${env.FROM_NAME}`,
            address: `${env.AUTH_EMAIL_ADDRESS}`,
          },
          to: [
            {
              email_address: {
                address: email,
              },
            },
          ],
          subject: "Password Reset Request",
          htmlbody: `<div>Reset your password </div>
          <a href=${url}/forgot-password/${verificationId}>Reset Password</a>
          <div>The link is valid for only 1 hour</div>
          <div>You have received this email because you or someone tried to reset the password. </div>
          <div>If you didn't send this, firstly reset your password and contact support.</div>
          <div>For support contact us at support[at]learningapp.link</div>
          `,
        }),
      });

      if (res.ok) {
        const verificationIdPromise = redis.set(
          verificationId,
          email,
          "EX",
          3600
        );

        let emailCountPromise;

        if (emailSentCount === null) {
          emailCountPromise = redis.set(`${email}:count`, 4, "EX", 86400);
        } else {
          emailCountPromise = redis.decr(`${email}:count`);
        }

        const emailSentPromise = redis.set(
          `${email}:sent`,
          new Date().getTime(),
          "EX",
          600
        );

        const [res1, res2, res3] = await Promise.all([
          verificationIdPromise,
          emailCountPromise,
          emailSentPromise,
        ]);

        if (res1 && res2 && res3) {
          return { verificationId };
        } else {
          throw new Error("Error while sending mail");
        }
      } else {
        throw new Error("Error while sending mail");
      }
    } else {
      return { emailSendLimit: true };
    }
  } catch (error) {
    console.log("error while sending mail", error);
    throw new Error("Error while sending mail");
  }
};

export const checkAuth = async () => {
  try {
    const token = (await cookies()).get("auth-token")?.value;

    if (!token) {
      return { isAuth: false, userInfo: null };
    }

    const decryptedCookie = aesDecrypt(token, EncryptionPurpose.SESSION_COOKIE);

    // ! TODO CHECK IF USER HAS BEEN BANNED OR DELETED OR LIMITED
    const sessionExists = await db.query.session.findFirst({
      columns: { id: true },
      where: eq(session.id, decryptedCookie),
      with: {
        user: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    if (!sessionExists) {
      return { isAuth: false, userInfo: null };
    }

    return { isAuth: true, userInfo: sessionExists.user };
  } catch (error) {
    console.log("error while checking auth", error);
    throw new Error("Error while checking auth");
  }
};

export const checkAuthorizationOfCourse = async ({
  courseId,
  userId,
}: {
  courseId: string;
  userId: string;
}) => {
  try {
    const courseMemberInfo = await db.query.courseMember.findFirst({
      where: and(
        eq(courseMember.courseId, courseId),
        eq(courseMember.userId, userId)
      ),
    });

    if (!courseMemberInfo) {
      return false;
    }
    return true;
  } catch (error) {
    console.log("error while checking authorization", error);
    throw new Error("Error while checking authorization");
  }
};

export const create2FASession = async (userId: string) => {
  const id = generateVerificationId();
  await redis.set(xxh32(`2fa_auth:${id}`).toString(16), userId, "EX", 7200);
  return id;
};

// 3 attempts with one minute interval
// then 3 attempts at 10 minutes interval
// TODO: use webhook
export const sendMagicLink = async ({
  email,
  url,
}: {
  email: string;
  url: string;
}) => {
  const verificationId = generateVerificationId();

  const LAST_SENT_TIME = {
    key: `${email}:ml_sent`,
    duration: 3600,
  };

  const EMAIL_SENT_COUNT = {
    key: `${email}:ml_count`,
    value: 0,
    limit: 6,
    duration: 86400,
  };

  const VERIFICATION_ID = {
    key: verificationId,
    value: email,
    duration: 7200,
  };

  try {
    const lastEmailSentTime = await redis.get(LAST_SENT_TIME.key);
    const emailSentCount = Number((await redis.get(EMAIL_SENT_COUNT.key)) || 0);

    if (Number(emailSentCount) >= EMAIL_SENT_COUNT.limit) {
      return { emailSendLimit: true };
    }

    if (lastEmailSentTime) {
      const timeNow = new Date().getTime();
      const differenceInSeconds = Math.floor(
        (timeNow - Number(lastEmailSentTime)) / 1000
      );

      let requiredInterval = 60; // default 1 minute for 3 requests

      if (emailSentCount >= 3) {
        requiredInterval = 600; // next 3 requests should be in 1 minute
      }

      if (differenceInSeconds < requiredInterval) {
        const remainingTime = requiredInterval - differenceInSeconds;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        if (minutes > 0) {
          return {
            waitTime: `${minutes} minutes ${seconds} seconds`,
          };
        } else {
          return {
            waitTime: `${seconds} seconds`,
          };
        }
      }
    }

    const res = await fetch("https://api.zeptomail.in/v1.1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${env.ZOHO_MAIL_TOKEN}`,
      },
      body: JSON.stringify({
        from: {
          name: `${env.FROM_NAME}`,
          address: `${env.AUTH_EMAIL_ADDRESS}`,
        },
        to: [
          {
            email_address: {
              address: email,
            },
          },
        ],
        subject: "Log in to Learning App",
        htmlbody: `<div>Log in as ${email} </div>
        <a href="${url}/magic-link/${verificationId}">Log in</a>

        <div>If you wish to copy the link, here is the link</div>
        <div>
        ${url}/magic-link/${verificationId}
        </div>
        <div>The link is valid for 2 hours</div>
        <div>You have received this email because you or someone tried to signup on the website </div>
        <div>If you didn't signup, kindly ignore this email.</div>
        <div>For support contact us at ${env.SUPPORT_EMAIL}</div>
        `,
      }),
    });

    if (!res.ok) {
      throw new Error("Error while sending mail");
    }

    const verificationIdPromise = redis.set(
      VERIFICATION_ID.key,
      VERIFICATION_ID.value,
      "EX",
      VERIFICATION_ID.duration
    );

    let emailCountPromise;

    if (emailSentCount === null) {
      emailCountPromise = redis.set(
        EMAIL_SENT_COUNT.key,
        EMAIL_SENT_COUNT.value,
        "EX",
        EMAIL_SENT_COUNT.duration
      );
    } else {
      emailCountPromise = redis.incr(EMAIL_SENT_COUNT.key);
    }

    const emailSentPromise = redis.set(
      LAST_SENT_TIME.key,
      new Date().getTime(),
      "EX",
      LAST_SENT_TIME.duration
    );

    const [res1, res2, res3] = await Promise.all([
      verificationIdPromise,
      emailCountPromise,
      emailSentPromise,
    ]);

    if (res1 && res2 && res3) {
      return { verificationId };
    } else {
      throw new Error("Error while sending mail");
    }
  } catch (error) {
    console.log("error while sending mail", error);
    throw new Error("Error while sending mail");
  }
};
