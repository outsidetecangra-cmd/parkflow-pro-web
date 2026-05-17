import { jsonError, jsonOk } from "@/lib/server/http";
import { decodeToken, getBearerToken } from "@/lib/server/security/token";
import { getSupabaseServerClient } from "@/lib/server/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return jsonError("JWT_SECRET ausente", 500, "MISSING_JWT_SECRET");
  }

  const token = getBearerToken(request.headers.get("authorization"));
  const payload = decodeToken(token, secret);
  if (!payload || payload.type !== "user") {
    return jsonError("Token invalido ou ausente", 401, "UNAUTHORIZED");
  }

  const supabase = getSupabaseServerClient();

  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id,name,roleId,unitId")
    .eq("id", payload.sub)
    .maybeSingle();

  if (userError) return jsonError(`Falha ao consultar usuÃ¡rio: ${userError.message}`, 500, "DB_ERROR");
  if (!user) return jsonError("Usuario nao encontrado", 401, "UNAUTHORIZED");

  const { data: roleRow } = user.roleId
    ? await supabase.from("Role").select("name").eq("id", user.roleId).maybeSingle()
    : { data: null as { name: string } | null };

  const { data: permissions } = user.roleId
    ? await supabase.from("Permission").select("code").eq("roleId", user.roleId)
    : { data: [] as Array<{ code: string }> };

  const { data: accesses, error: accessError } = await supabase
    .from("UserUnitAccess")
    .select("unitId,isDefault,createdAt")
    .eq("userId", user.id)
    .order("createdAt", { ascending: true });

  if (accessError) return jsonError(`Falha ao consultar acessos: ${accessError.message}`, 500, "DB_ERROR");

  const allowedUnitIds = (accesses ?? []).map((access) => access.unitId);
  const activeUnitId =
    accesses?.find((access) => access.isDefault)?.unitId ?? accesses?.[0]?.unitId ?? user.unitId ?? null;

  const { data: units } = allowedUnitIds.length
    ? await supabase.from("Unit").select("id,name").in("id", allowedUnitIds)
    : { data: [] as Array<{ id: string; name: string }> };

  const activeUnit = activeUnitId ? (units ?? []).find((unit) => unit.id === activeUnitId) ?? null : null;

  const { data: defaultParkingLot } = activeUnitId
    ? await supabase.from("ParkingLot").select("id,name").eq("unitId", activeUnitId).order("name").limit(1).maybeSingle()
    : { data: null as { id: string; name: string } | null };

  const { data: defaultPriceTable } = activeUnitId
    ? await supabase
        .from("PriceTable")
        .select("id,name")
        .eq("unitId", activeUnitId)
        .eq("active", true)
        .order("name")
        .limit(1)
        .maybeSingle()
    : { data: null as { id: string; name: string } | null };

  const { data: defaultCamera } = activeUnitId
    ? await supabase.from("Camera").select("id,name").eq("unitId", activeUnitId).order("name").limit(1).maybeSingle()
    : { data: null as { id: string; name: string } | null };

  const { data: defaultTerminal } = activeUnitId
    ? await supabase.from("Terminal").select("id,name").eq("unitId", activeUnitId).order("name").limit(1).maybeSingle()
    : { data: null as { id: string; name: string } | null };

  return jsonOk({
    user: { id: user.id, name: user.name, role: roleRow?.name ?? null },
    activeUnit: activeUnit ? { id: activeUnit.id, name: activeUnit.name } : null,
    operationDefaults: {
      parkingLotId: defaultParkingLot?.id ?? null,
      parkingLotName: defaultParkingLot?.name ?? null,
      priceTableId: defaultPriceTable?.id ?? null,
      priceTableName: defaultPriceTable?.name ?? null,
      cameraId: defaultCamera?.id ?? null,
      cameraName: defaultCamera?.name ?? null,
      terminalId: defaultTerminal?.id ?? null,
      terminalName: defaultTerminal?.name ?? null
    },
    permissions: (permissions ?? []).map((permission) => permission.code),
    allowedUnits: (accesses ?? []).map((access) => {
      const unit = (units ?? []).find((u) => u.id === access.unitId);
      return { id: access.unitId, name: unit?.name ?? access.unitId, isDefault: access.isDefault };
    })
  });
}
