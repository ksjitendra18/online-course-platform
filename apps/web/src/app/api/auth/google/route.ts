import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { createId, init } from "@paralleldrive/cuid2";
import { createHash } from "node:crypto";
import queryString from "query-string";

import { env } from "@/utils/env/server";

export async function GET(request: NextRequest) {
  const generateId = init({ length: 48 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const googleOauthState = createId();

  cookies().set("google_oauth_state", googleOauthState, {
    path: "/",
  });

  cookies().set("login_method", "google", {
    path: "/",
  });

  if (type) {
    cookies().set("signup_type", "organization", {
      path: "/",
    });
  }

  const googleCodeChallenge = generateId();
  const codeChallenge = createHash("sha256")
    .update(googleCodeChallenge)
    .digest("base64url");

  cookies().set("google_code_challenge", googleCodeChallenge, {
    path: "/",
  });

  const authorizationUrl = queryString.stringifyUrl({
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    query: {
      scope: "openid email profile",
      response_type: "code",
      client_id: env.GOOGLE_AUTH_CLIENT,
      redirect_uri: env.GOOGLE_AUTH_CALLBACK_URL,
      state: googleOauthState,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    },
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizationUrl,
    },
  });
}
