import {
  checkUserExists,
  createLoginLog,
  createSession,
  createUser,
  saveOauthToken,
  updateOauthToken,
} from "@/lib/auth";
import { encryptCookie } from "@/lib/cookies";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

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
    formData.append("client_id", process.env.GOOGLE_AUTH_CLIENT!);
    formData.append("client_secret", process.env.GOOGLE_AUTH_SECRET!);
    formData.append("redirect_uri", process.env.GOOGLE_AUTH_CALLBACK_URL!);
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

    const userExists = await checkUserExists({
      email: fetchUserRes.email,
      strategy: "google",
    });

    const userAgent = request.headers.get("user-agent") as string;

    const userIp = request.headers.get("X-Forwarded-For") ?? "dev";

    if (!userExists) {
      const { userId } = await createUser({
        email: fetchUserRes.email,
        name: fetchUserRes.name,
        profilePhoto: fetchUserRes.picture,
        userName: fetchUserRes.email.split("@")[0],
        emailVerified: true,
      });

      await saveOauthToken({
        userId: userId,
        strategy: "google",
        accessToken: fetchTokenRes.access_token,
        refreshToken: fetchTokenRes.refresh_token,
      });

      const { sessionId, expiresAt } = await createSession({
        userId: userId,
        userAgent,
        userIp,
      });

      // log
      await createLoginLog({
        sessionId,
        userAgent: userAgent,
        userId: userId,
        ip: userIp,
      });

      cookies().delete("google_oauth_state");
      cookies().delete("google_code_challenge");

      const encryptedSessionId = await encryptCookie(sessionId);

      cookies().set("auth-token", encryptedSessionId, {
        sameSite: "lax",
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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
    } else {
      if (userExists.oauthToken.length > 0) {
        // oauth strategy exists
        // update token

        await updateOauthToken({
          userId: userExists.id,
          strategy: "google",
          accessToken: fetchTokenRes.access_token,
          refreshToken: fetchTokenRes.refresh_token,
        });
      } else {
        await saveOauthToken({
          userId: userExists.id,
          strategy: "google",
          accessToken: fetchTokenRes.access_token,
          refreshToken: fetchTokenRes.refresh_token,
        });
      }

      const { sessionId, expiresAt } = await createSession({
        userId: userExists.id,
        userAgent,
        userIp,
      });

      await createLoginLog({
        sessionId,
        userAgent: userAgent,
        userId: userExists.id,
        ip: userIp,
      });

      cookies().delete("google_oauth_state");
      cookies().delete("google_code_challenge");

      const encryptedSessionId = await encryptCookie(sessionId);

      cookies().set("auth-token", encryptedSessionId, {
        sameSite: "lax",
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }
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
