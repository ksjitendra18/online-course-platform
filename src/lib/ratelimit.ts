import redis from "@/lib/redis";

export const rateLimit = async (
  key: string,
  limit: number,
  duration: number,
  message?: string
) => {
  const count = await redis.get(key);

  if (count !== null) {
    const countNumber = Number(count);

    if (countNumber < 1) {
      return Response.json(
        {
          error: {
            code: "rate_limit",
            message: message ?? "Too many requests. Please try again later.",
          },
        },
        { status: 429 }
      );
    } else {
      await redis.decr(key);
    }
  } else {
    await redis.set(key, limit, "EX", duration);
  }
};
