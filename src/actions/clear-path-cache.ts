"use server";

import { revalidatePath } from "next/cache";

export async function clearPathCache(path: string) {
  revalidatePath(path);
}
