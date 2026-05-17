import { jsonError, jsonOk } from "@/lib/server/http";
import { verifyPassword } from "@/lib/server/security/password";
import { encodeToken } from "@/lib/server/security/token";
import { getPrismaClient } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { login?: string; password?: string };
  try {
    body = (await request.json()) as { login?: string; password?: string };
  } catch {
    return jsonError("Payload invÃ¡lido", 400, "INVALID_AUTH_PAYLOAD");
  }

  if (!body.login || !body.password) {
    return jsonError("Login e senha sao obrigatorios", 400, "INVALID_AUTH_PAYLOAD");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return jsonError("JWT_SECRET ausente", 500, "MISSING_JWT_SECRET");
  }

  const prisma = getPrismaClient();

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: body.login }, { username: body.login }] },
    include: {
      role: { include: { permissions: true } },
      unitAccesses: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    return jsonError("Credenciais invalidas", 401, "INVALID_CREDENTIALS");
  }

  const defaultUnit =
    user.unitAccesses.find((access) => access.isDefault)?.unitId ?? user.unitId ?? user.unitAccesses[0]?.unitId ?? null;

  const now = Math.floor(Date.now() / 1000);
  const accessExp = now + 60 * 60; // 1h
  const refreshExp = now + 60 * 60 * 24 * 7; // 7d

  return jsonOk({
    accessToken: encodeToken(
      {
        sub: user.id,
        type: "user",
        role: user.role?.name,
        unitId: defaultUnit ?? undefined,
        name: user.name,
        iat: now,
        exp: accessExp
      },
      secret
    ),
    refreshToken: encodeToken(
      {
        sub: user.id,
        type: "user",
        role: user.role?.name,
        iat: now,
        exp: refreshExp
      },
      secret
    ),
    user: {
      id: user.id,
      name: user.name,
      role: user.role?.name ?? null,
      allowedUnitIds: user.unitAccesses.map((access) => access.unitId)
    },
    permissions: user.role?.permissions.map((permission) => permission.code) ?? []
  });
}
