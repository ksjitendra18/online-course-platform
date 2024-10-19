import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import { env } from "@/utils/env/server";

const algorithm = "aes-256-gcm";
const ivLength = 12;
const tagLength = 16;

export enum EncryptionPurpose {
  RECOVERY_CODE = "RECOVERY_CODE_SECRET",
  TWO_FA_SECRET = "TWO_FA_SECRET",
  SESSION_COOKIE = "SESSION_COOKIE_SECRET",
}

export function aesEncrypt(plaintext: string, purpose: EncryptionPurpose) {
  try {
    const SECRET_KEY = env[purpose]!;

    const iv = randomBytes(ivLength);
    const cipher = createCipheriv(algorithm, SECRET_KEY, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  } catch (error) {
    console.log("Error while encrypting data", error);
    throw new Error("Error while encrypting data");
  }
}

export function aesDecrypt(ciphertext: string, purpose: EncryptionPurpose) {
  try {
    const SECRET_KEY = env[purpose];

    if (!SECRET_KEY) {
      throw new Error("Secret key not found");
    }

    const buffer = Buffer.from(ciphertext, "base64");
    const iv = buffer.subarray(0, ivLength);
    const tag = buffer.subarray(ivLength, ivLength + tagLength);

    const encrypted = buffer.subarray(ivLength + tagLength);
    const decipher = createDecipheriv(algorithm, SECRET_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = decipher.update(encrypted) + decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.log("Error while decrypting data", error);
    throw new Error("Error while decrypting data");
  }
}
