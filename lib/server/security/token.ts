type TokenPayload = {
  sub: string;
  type: "user" | "agent";
  role?: string;
  unitId?: string;
  unitCode?: string;
  name?: string;
  iat: number; // unix seconds
  exp: number; // unix seconds
};

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadB64: string, secret: string) {
  const crypto = require("crypto") as typeof import("crypto");
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function encodeToken(payload: TokenPayload, secret: string) {
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export function decodeToken(token: string | null | undefined, secret: string): TokenPayload | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  if (sign(payloadB64, secret) !== signature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as TokenPayload;
    if (!payload?.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getBearerToken(authorization?: string | null) {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

