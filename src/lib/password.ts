import { pbkdf2Sync, randomBytes } from "node:crypto";

const ITERATIONS = 100_000;
const KEY_LEN = 64;
const DIGEST = "sha512";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex");
  // Constant-time compare
  if (derived.length !== hash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < derived.length; i++) {
    mismatch |= derived.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return mismatch === 0;
}
