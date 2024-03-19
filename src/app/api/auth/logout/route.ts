import { db } from "@/db";
import { session } from "@/db/schema";
import redis from "@/lib/redis";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const authToken = cookies().get("auth-token")?.value;
  try {
    if (authToken) {
      const dbPromise = db.delete(session).where(eq(session.id, authToken));

      const redisPromise = redis.del(authToken);

      Promise.all([dbPromise, redisPromise]);
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: true });
  } finally {
    cookies().delete("auth-token");
  }
}
