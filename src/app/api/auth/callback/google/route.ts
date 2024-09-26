import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { EncryptionPurpose, aesEncrypt } from "@/lib/aes";
import {
  checkOauthUserExists,
  create2FASession,
  createLoginLog,
  createOauthProvider,
  createSession,
  createUser,
} from "@/lib/auth";
import { env } from "@/utils/env/server";

export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams?.get("code");
  const state = new URL(request.url).searchParams?.get("state");
  const storedState = cookies().get("google_oauth_state")?.value;
  const codeVerifier = cookies().get("google_code_challenge")?.value;

  if (storedState !== state || !codeVerifier || !code) {
    cookies().delete("google_oauth_state");
    cookies().delete("google_code_challenge");
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login?error=Server+Error",
      },
    });
  }

  try {
    const tokenUrl = "https://www.googleapis.com/oauth2/v4/token";

    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", env.GOOGLE_AUTH_CLIENT);
    formData.append("client_secret", env.GOOGLE_AUTH_SECRET);
    formData.append("redirect_uri", env.GOOGLE_AUTH_CALLBACK_URL);
    formData.append("code", code);
    formData.append("code_verifier", codeVerifier);

    const fetchToken = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const fetchTokenRes = await fetchToken.json();

    const fetchUser = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${fetchTokenRes.access_token}` },
      }
    );
    const fetchUserRes = await fetchUser.json();

    const userExists = await checkOauthUserExists({
      providerId: fetchUserRes.id,
      strategy: "google",
      email: fetchUserRes.email,
    });

    const userAgent = request.headers.get("user-agent") as string;

    const userIp = request.headers.get("X-Forwarded-For") ?? "dev";

    if (!userExists) {
      const { userId } = await createUser({
        email: fetchUserRes.email,
        name: fetchUserRes.name,
        avatar: fetchUserRes.picture,
        userName: fetchUserRes.email.split("@")[0],
        emailVerified: true,
      });

      await createOauthProvider({
        providerId: fetchUserRes.id,
        userId: userId,
        strategy: "google",
      });

      const { sessionId, expiresAt } = await createSession({
        userId: userId,
      });

      await createLoginLog({
        sessionId,
        userAgent: userAgent,
        userId: userId,
        strategy: "google",
        ip: userIp,
      });

      cookies().delete("google_oauth_state");
      cookies().delete("google_code_challenge");

      const encryptedSessionId = aesEncrypt(
        sessionId,
        EncryptionPurpose.SESSION_COOKIE
      );

      cookies().set("auth-token", encryptedSessionId, {
        sameSite: "lax",
        expires: expiresAt,
        httpOnly: true,
        domain:
          env.NODE_ENV === "production" ? ".learningapp.link" : "localhost",
        secure: env.NODE_ENV === "production",
      });

      const signupType = cookies().get("signup_type")?.value;

      cookies().delete("signup_type");

      const redirectLocation =
        signupType === "organization" ? "/organization-setup" : "/dashboard";

      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectLocation,
        },
      });
    } else if (userExists.oauthProvider.length < 0) {
      await createOauthProvider({
        providerId: fetchUserRes.id,
        userId: userExists.id,
        strategy: "google",
      });
    }

    if (userExists.twoFactorEnabled) {
      const faSess = await create2FASession(userExists.id);

      cookies().set("login_method", "google", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
      });

      cookies().set("2fa_auth", faSess, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
      });

      return Response.json(
        { message: "2FA required", redirect: "/verify-two-factor" },
        {
          status: 302,
          headers: {
            Location: "/verify-two-factor",
          },
        }
      );
    }
    const { sessionId, expiresAt } = await createSession({
      userId: userExists.id,
    });

    await createLoginLog({
      sessionId,
      userAgent: userAgent,
      userId: userExists.id,
      strategy: "google",
      ip: userIp,
    });

    cookies().delete("google_oauth_state");
    cookies().delete("google_code_challenge");

    const encryptedSessionId = aesEncrypt(
      sessionId,
      EncryptionPurpose.SESSION_COOKIE
    );

    cookies().set("auth-token", encryptedSessionId, {
      sameSite: "lax",
      expires: expiresAt,
      httpOnly: true,
      domain: env.NODE_ENV === "production" ? ".learningapp.link" : "localhost",
      secure: env.NODE_ENV === "production",
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (error) {
    console.log("error GOOGLE LOGIN", error);
    cookies().delete("google_oauth_state");
    cookies().delete("google_code_challenge");
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login?error=Server+Error",
      },
    });
  }
}
