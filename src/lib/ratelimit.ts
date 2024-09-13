import redis from "@/lib/redis";

type RateLimitOptions = {
  key: string;
  limit: number;
  duration: number;
  message?: string;
};

// /**
//  * @param options key: string
//  * @param options limit: number
//  * @param options duration: number in seconds, -1 for infinity
//  * @param message optional string. Default is "Too many requests. Please try again later."
//  *
//  * @returns null if rate limit is not exceeded, else returns a response with error code and message
//  */

/**
 * Configuration options for rate limiting.
 *
 * @property {string} key - A unique identifier for the rate limit (usually the user's IP or user ID).
 * @property {number} limit - The maximum number of allowed requests within the specified duration.
 * @property {number} duration - The time window (in seconds) during which the number of requests is counted.
 * @property {string} [message] - Optional custom message to be returned when the rate limit is exceeded.
 */
export const rateLimit = async (options: RateLimitOptions) => {
  if (!options.key) {
    throw new Error("key is required");
  }
  const count = await redis.get(options.key);

  if (count !== null) {
    const countNumber = Number(count);

    if (countNumber < 1) {
      return Response.json(
        {
          error: {
            code: "rate_limit",
            message:
              options.message ?? "Too many requests. Please try again later.",
          },
        },
        { status: 429 }
      );
    } else {
      await redis.decr(options.key);
    }
  } else {
    if (options.duration > 0) {
      await redis.set(options.key, options.limit, "EX", options.duration);
    } else {
      await redis.set(options.key, options.limit);
    }
  }
};
