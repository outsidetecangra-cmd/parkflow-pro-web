import { decodeToken, getBearerToken } from "@/lib/server/security/token";

export function requireUser(request: Request) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { ok: false as const, error: { status: 500, code: "MISSING_JWT_SECRET", message: "JWT_SECRET ausente" } };
  }

  const token = getBearerToken(request.headers.get("authorization"));
  const payload = decodeToken(token, secret);
  if (!payload || payload.type !== "user") {
    return { ok: false as const, error: { status: 401, code: "UNAUTHORIZED", message: "Token invalido ou ausente" } };
  }

  return { ok: true as const, payload };
}

