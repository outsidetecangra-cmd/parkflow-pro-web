import { jsonError, jsonOk } from "@/lib/server/http";
import { decodeToken, getBearerToken } from "@/lib/server/security/token";
import { getPrismaClient } from "@/lib/server/prisma";

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

  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      role: { include: { permissions: true } },
      unit: true,
      unitAccesses: {
        include: { unit: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!user) return jsonError("Usuario nao encontrado", 401, "UNAUTHORIZED");

  const activeUnit =
    user.unitAccesses.find((access) => access.isDefault)?.unit ??
    user.unitAccesses[0]?.unit ??
    user.unit ??
    null;

  const unitDefaults = activeUnit
    ? await prisma.unit.findUnique({
        where: { id: activeUnit.id },
        include: {
          parkingLots: { orderBy: { name: "asc" }, take: 1 },
          priceTables: { where: { active: true }, orderBy: { name: "asc" }, take: 1 },
          cameras: { orderBy: { name: "asc" }, take: 1 },
          terminals: { orderBy: { name: "asc" }, take: 1 }
        }
      })
    : null;

  const parkingLot = unitDefaults?.parkingLots[0] ?? null;
  const priceTable = unitDefaults?.priceTables[0] ?? null;
  const camera = unitDefaults?.cameras[0] ?? null;
  const terminal = unitDefaults?.terminals[0] ?? null;

  return jsonOk({
    user: { id: user.id, name: user.name, role: user.role?.name ?? null },
    activeUnit: activeUnit ? { id: activeUnit.id, name: activeUnit.name } : null,
    operationDefaults: {
      parkingLotId: parkingLot?.id ?? null,
      parkingLotName: parkingLot?.name ?? null,
      priceTableId: priceTable?.id ?? null,
      priceTableName: priceTable?.name ?? null,
      cameraId: camera?.id ?? null,
      cameraName: camera?.name ?? null,
      terminalId: terminal?.id ?? null,
      terminalName: terminal?.name ?? null
    },
    permissions: user.role?.permissions.map((permission) => permission.code) ?? [],
    allowedUnits: user.unitAccesses.map((access) => ({
      id: access.unit.id,
      name: access.unit.name,
      isDefault: access.isDefault
    }))
  });
}
