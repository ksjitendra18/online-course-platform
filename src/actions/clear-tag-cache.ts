"use server";

import { getUserSessionRedis } from "@/db/queries/auth";
import { revalidateTag } from "next/cache";

export async function clearTagCache(tag: string) {
  revalidateTag(tag);
}

export async function clearTagCacheByUserId(tag: string) {
  const user = await getUserSessionRedis();

  if (user) {
    const userTag = tag.replace("-userId", `-${user.userId}`);
    revalidateTag(userTag);
  } else {
    revalidateTag(tag);
  }
}
