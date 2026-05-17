import { createHash, timingSafeEqual } from "crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyPassword(value: string, storedHash: string) {
  if (!storedHash) return false;

  if (storedHash.startsWith("sha256:")) {
    const current = Buffer.from(sha256(value), "utf8");
    const stored = Buffer.from(storedHash.slice(7), "utf8");
    return current.length === stored.length && timingSafeEqual(current, stored);
  }

  if (storedHash.startsWith("plain:")) {
    return storedHash.slice(6) === value;
  }

  return false;
}

