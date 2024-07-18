import { db } from "@/db";
import { session } from "@/db/schema";
import { decryptCookie } from "@/lib/cookies";
import redis from "@/lib/redis";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const authToken = cookies().get("auth-token")?.value;
  try {
    if (authToken) {
      const decryptedToken = await decryptCookie(authToken);
      const dbPromise = db
        .delete(session)
        .where(eq(session.id, decryptedToken));
      const redisPromise = redis.del(decryptedToken);
      Promise.all([dbPromise, redisPromise]);
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error while logout", error, authToken);
    return Response.json({ success: true });
  } finally {
    cookies().delete("auth-token");
  }
}
