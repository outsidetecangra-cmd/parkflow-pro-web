import { jsonError, jsonOk } from "@/lib/server/http";
import { verifyPassword } from "@/lib/server/security/password";
import { encodeToken } from "@/lib/server/security/token";
import { getSupabaseServerClient } from "@/lib/server/supabase";

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

  const supabase = getSupabaseServerClient();

  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id,email,username,name,passwordHash,roleId,unitId")
    .or(`email.eq.${body.login},username.eq.${body.login}`)
    .maybeSingle();

  if (userError) {
    return jsonError(`Falha ao consultar usuÃ¡rio: ${userError.message}`, 500, "DB_ERROR");
  }

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    return jsonError("Credenciais invalidas", 401, "INVALID_CREDENTIALS");
  }

  const { data: unitAccesses, error: accessError } = await supabase
    .from("UserUnitAccess")
    .select("unitId,isDefault,createdAt")
    .eq("userId", user.id)
    .order("createdAt", { ascending: true });

  if (accessError) {
    return jsonError(`Falha ao consultar acessos: ${accessError.message}`, 500, "DB_ERROR");
  }

  const defaultUnit =
    unitAccesses?.find((access) => access.isDefault)?.unitId ?? user.unitId ?? unitAccesses?.[0]?.unitId ?? null;

  const { data: roleRow } = user.roleId
    ? await supabase.from("Role").select("name").eq("id", user.roleId).maybeSingle()
    : { data: null as { name: string } | null };

  const { data: permissions } = user.roleId
    ? await supabase.from("Permission").select("code").eq("roleId", user.roleId)
    : { data: [] as Array<{ code: string }> };

  const now = Math.floor(Date.now() / 1000);
  const accessExp = now + 60 * 60; // 1h
  const refreshExp = now + 60 * 60 * 24 * 7; // 7d

  return jsonOk({
    accessToken: encodeToken(
      {
        sub: user.id,
        type: "user",
        role: roleRow?.name,
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
        role: roleRow?.name,
        iat: now,
        exp: refreshExp
      },
      secret
    ),
    user: {
      id: user.id,
      name: user.name,
      role: roleRow?.name ?? null,
      allowedUnitIds: (unitAccesses ?? []).map((access) => access.unitId)
    },
    permissions: (permissions ?? []).map((permission) => permission.code)
  });
}
