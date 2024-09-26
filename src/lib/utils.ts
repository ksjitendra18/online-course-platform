import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { db } from "@/db";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
}

// export function formatDate(date: string | number) {
//   const createdAtUTC = new Date(date + " UTC");
//   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   const createdAtLocal = createdAtUTC.toLocaleString("en-IN", {
//     day: "numeric",
//     month: "long",
//     year: "2-digit",
//     timeZone: "Asia/Calcutta",
//   });

//   return createdAtLocal;
// }
export function formatDate(date: number) {
  const createdAtUTC = new Date(date);

  const createdAtLocal = createdAtUTC.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "2-digit",
    timeZone: "Asia/Calcutta",
  });

  return createdAtLocal;
}
export function formatDateTime(date: number) {
  const createdAtUTC = new Date(date);
  // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const createdAtLocal = createdAtUTC.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Calcutta",
  });

  return createdAtLocal;
}

export function capitalizeFirstWord(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDuration(durationInSeconds: number) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  let formattedDuration = "";
  if (hours > 0) {
    formattedDuration += hours + "h";
    if (minutes > 0) {
      formattedDuration += " " + Math.ceil(minutes) + "min";
    }
  } else {
    if (minutes > 0) {
      formattedDuration += minutes + "min";
      if (seconds > 0) {
        formattedDuration += " " + Math.ceil(seconds) + "s";
      }
    } else {
      formattedDuration += seconds + "s";
    }
  }

  return formattedDuration.trim();
}

// export async function createTransaction<T extends typeof db>(
//   cb: (trx: T) => void
// ) {
//   await db.transaction(cb as any);
// }
