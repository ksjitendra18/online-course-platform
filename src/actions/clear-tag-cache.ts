"use server";

import { revalidateTag } from "next/cache";

import { getUserSessionRedis } from "@/db/queries/auth";

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
