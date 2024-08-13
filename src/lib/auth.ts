import Bowser from "bowser";
import { and, eq } from "drizzle-orm";
// import murmurHash from "murmurhash3js";
import { xxh64 } from "@node-rs/xxhash";

import { customAlphabet } from "nanoid";
import crypto from "node:crypto";

import { db } from "@/db";
import { hash } from "@node-rs/argon2";
import redis from "./redis";

import {
  courseMember,
  device,
  loginLog,
  oauthToken,
  password,
  session,
  user,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { cookies } from "next/headers";
import { decryptCookie } from "./cookies";
// import getPlanData from "@/db/queries/plans/get-plan-data";

type NewUserArgs = {
  email: string;
  userName: string;
  name: string;
  profilePhoto: string;
  emailVerified: boolean;
};

type UserExistArgs = {
  email: string;
  strategy: "google" | "github";
};

type NewSessionArgs = {
  userId: string;
  userIp: string;
  userAgent: string;
};

type NewLogsArgs = {
  userAgent: string | null;
  userId: string;
  sessionId: string;
  ip: string;
};

type TokenArgs = {
  userId: string;
  strategy: "github" | "google";
  refreshToken: string;
  accessToken: string;
};

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 14);

export const createUser = async ({
  email,
  name,
  profilePhoto,
  userName,
  emailVerified,
}: NewUserArgs) => {
  try {
    const newUser = await db
      .insert(user)
      .values({
        name,
        userName,
        email,
      })
      .returning({ id: user.id });

    return { userId: newUser[0].id };
  } catch (error) {
    throw new Error("Error while creating user");
  }
};

export const checkUserExists = async ({ email, strategy }: UserExistArgs) => {
  const userExists = await db.query.user.findFirst({
    where: eq(user.email, email),
    columns: { id: true },
    with: {
      oauthToken: {
        columns: { id: true },
        where: eq(oauthToken.strategy, strategy),
      },
    },
  });

  return userExists;
};

export const createSession = async ({
  userId,
  userAgent,
  userIp,
}: NewSessionArgs) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const parser = Bowser.getParser(userAgent);

    const deviceId = createId();

    const newSession = await db
      .insert(session)
      .values({
        deviceId,
        expiresAt: BigInt(expiresAt.getTime()),
        userIp,
        userId,
      })
      .returning({ id: session.id });

    const deviceFingerPrint = crypto
      .createHash("sha256")
      .update(userAgent)
      .digest("hex");

    await db.insert(device).values({
      id: deviceId,
      userId,
      sessionId: newSession[0].id,
      browser: `${parser.getBrowser().name}`,
      deviceFingerPrint,
      userIp,
      os: `${parser.getOS().name} ${parser.getOS().version}`,
      lastActive: new Date().getTime(),
      loggedIn: true,
    });

    return { sessionId: newSession[0].id, expiresAt };
  } catch (error) {
    throw new Error("Failed to create session");
  }
};

export const saveOauthToken = async ({
  accessToken,
  refreshToken,
  strategy,
  userId,
}: TokenArgs) => {
  try {
    await db.insert(oauthToken).values({
      userId,
      strategy: strategy,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    throw new Error("Error while creating token");
  }
};

export const updateOauthToken = async ({
  accessToken,
  refreshToken,
  strategy,
  userId,
}: TokenArgs) => {
  try {
    await db
      .update(oauthToken)
      .set({
        accessToken,
        refreshToken,
      })
      .where(
        and(eq(oauthToken.userId, userId), eq(oauthToken.strategy, strategy))
      );
  } catch (error) {
    throw new Error("Error while creating token");
  }
};

export const createLoginLog = async ({
  userAgent,
  userId,
  sessionId,
  ip,
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
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
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
          Authorization: `${process.env.ZOHO_MAIL_TOKEN}`,
        },
        // to: email,
        body: JSON.stringify({
          from: { address: "auth-noreply@learningapp.link" },
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
        // !EXPERIMENTAL
        // const hashedVerificationId = murmurHash.x64
        //   .hash128(verificationId)
        //   .slice(0, 12);
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
          console.log("decrementing", redis.get(`${email}:count`));
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
          Authorization: `${process.env.ZOHO_MAIL_TOKEN}`,
        },
        body: JSON.stringify({
          from: { address: "auth-donotreply@learningapp.link" },
          to: [
            {
              email_address: {
                address: email,
              },
            },
          ],
          subject: `Password Reset Request`,
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
    const token = cookies().get("auth-token")?.value;

    if (!token) {
      return { isAuth: false, userInfo: null };
    }

    const decryptedToken = await decryptCookie(token);

    const sessionExists = await db.query.session.findFirst({
      columns: { id: true, active: true },
      where: eq(session.id, decryptedToken),
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
    throw new Error("Error while checking authorization");
  }
};
