import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { cookies } from "next/headers";

const algorithm = "aes-256-gcm";
const ivLength = 12;
const tagLength = 16;

const SECRET_KEY = process.env.COOKIE_SECRET!;

export async function encryptCookie(plaintext: string) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, SECRET_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export async function decryptCookie(ciphertext: string) {
  try {
    const buffer = Buffer.from(ciphertext, "base64");
    const iv = buffer.slice(0, ivLength);
    const tag = buffer.slice(ivLength, ivLength + tagLength);
    const encrypted = buffer.slice(ivLength + tagLength);
    const decipher = createDecipheriv(algorithm, SECRET_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = decipher.update(encrypted) + decipher.final("utf8");
    return decrypted;
  } catch (error) {
    // for handling the case when secret key is changed
    cookies().delete("auth-token");
    throw new Error("Error while decrypting cookie");
  }
}
