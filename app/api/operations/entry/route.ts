import { jsonError, jsonOk } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { getPrismaClient } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return jsonError(auth.error.message, auth.error.status, auth.error.code);

  let body: {
    unitId?: string;
    origin?: string;
    plate?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    yardId?: string;
    priceTableId?: string;
    terminalId?: string;
    cameraId?: string;
    lpr?: { plate?: string; confidence?: number };
    notes?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Payload invÃ¡lido", 400, "INVALID_ENTRY_PAYLOAD");
  }

  if (!body.unitId || !body.plate || !body.yardId || !body.priceTableId) {
    return jsonError("unitId, plate, yardId e priceTableId sao obrigatorios", 400, "INVALID_ENTRY_PAYLOAD");
  }

  const prisma = getPrismaClient();

  const [unit, parkingLot, priceTable, existingVehicle] = await Promise.all([
    prisma.unit.findUnique({ where: { id: body.unitId } }),
    prisma.parkingLot.findUnique({ where: { id: body.yardId } }),
    prisma.priceTable.findUnique({ where: { id: body.priceTableId } }),
    prisma.vehicle.findUnique({
      where: { plate: body.plate },
      include: { customer: { include: { monthlyCustomer: true } } }
    })
  ]);

  if (!unit || !parkingLot || !priceTable) {
    return jsonError("Unidade, patio ou tabela de preco nao encontrados", 404, "ENTRY_DEPENDENCY_NOT_FOUND");
  }

  if (parkingLot.unitId !== unit.id || (priceTable.unitId && priceTable.unitId !== unit.id)) {
    return jsonError("Patio ou tabela de preco nao pertencem a unidade informada", 403, "UNIT_SCOPE_MISMATCH");
  }

  const openTicket = await prisma.ticket.findFirst({
    where: { status: "OPEN", vehicle: { plate: body.plate } }
  });
  if (openTicket) return jsonError("A placa ja possui uma entrada em aberto", 403, "OPEN_TICKET_ALREADY_EXISTS");

  const credential = await prisma.credential.findFirst({
    where: { plate: body.plate },
    orderBy: { validUntil: "desc" }
  });
  if (credential?.validUntil && credential.validUntil < new Date()) {
    return jsonError("Credencial vencida", 403, "EXPIRED_CREDENTIAL");
  }

  if (existingVehicle?.customer?.monthlyCustomer?.status === "inadimplente") {
    return jsonError("Mensalista inadimplente bloqueado para entrada", 403, "MONTHLY_CUSTOMER_IN_DEFAULT");
  }

  const vehicle =
    existingVehicle ??
    (await prisma.vehicle.create({
      data: { plate: body.plate, model: body.vehicleModel ?? "Nao informado", color: body.vehicleColor ?? null }
    }));

  const ticketCode = `TK-${Date.now()}`;
  const qrCode = `QR-${ticketCode}`;
  const entryAt = new Date();

  const ticket = await prisma.ticket.create({
    data: {
      code: ticketCode,
      unitId: unit.id,
      status: "OPEN",
      vehicleId: vehicle.id,
      customerId: existingVehicle?.customerId ?? null,
      parkingLotId: parkingLot.id,
      priceTableId: priceTable.id,
      entryAt,
      paymentDeadline: null,
      origin: body.origin ?? "WEB",
      qrCode,
      notes: body.notes ?? null
    }
  });

  await prisma.movement.create({
    data: {
      ticketId: ticket.id,
      type: "ENTRY_REGISTERED",
      payload: {
        plate: body.plate,
        patio: parkingLot.name,
        terminalId: body.terminalId ?? null,
        cameraId: body.cameraId ?? null,
        lpr: body.lpr ?? null
      }
    }
  });

  if (body.cameraId && body.lpr?.plate) {
    await prisma.lprCapture.create({
      data: {
        ticketId: ticket.id,
        cameraId: body.cameraId,
        unitId: unit.id,
        plate: body.lpr.plate,
        confidence: body.lpr.confidence ?? 0,
        direction: "entrada",
        status: "validado"
      }
    });
  }

  return jsonOk({
    ticket: {
      id: ticket.id,
      code: ticket.code,
      status: ticket.status,
      entryAt: ticket.entryAt,
      qrCode: ticket.qrCode
    },
    gateAction: { allowed: true, reason: null }
  });
}
