"use server";

import { revalidatePath } from "next/cache";

export async function clearTagCache(path: string) {
  revalidatePath(path);
}
