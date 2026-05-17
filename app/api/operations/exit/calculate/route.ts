import { computePricing } from "@/app/api/operations/_shared";
import { jsonError, jsonOk } from "@/lib/server/http";
import { getPrismaClient } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    ticketCode?: string;
    unitId?: string;
    exitAt?: string;
    couponCode?: string | null;
    partnerValidationCode?: string | null;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Payload invÃ¡lido", 400, "INVALID_EXIT_CALCULATION_PAYLOAD");
  }

  if (!body.ticketCode) {
    return jsonError("ticketCode e obrigatorio", 400, "INVALID_EXIT_CALCULATION_PAYLOAD");
  }

  const prisma = getPrismaClient();

  const ticket = await prisma.ticket.findUnique({
    where: { code: body.ticketCode },
    include: {
      vehicle: true,
      priceTable: { include: { rules: true } }
    }
  });
  if (!ticket) return jsonError("Ticket nao encontrado", 404, "TICKET_NOT_FOUND");

  if (ticket.unitId && body.unitId && ticket.unitId !== body.unitId) {
    return jsonError("O ticket nao pertence a unidade informada", 403, "UNIT_SCOPE_MISMATCH");
  }

  const exitAt = body.exitAt ? new Date(body.exitAt) : new Date();
  const entryAt = ticket.entryAt;

  const firstHourRule = ticket.priceTable?.rules?.find((rule) => rule.ruleType === "primeira_hora");
  const additionalFractionRule = ticket.priceTable?.rules?.find((rule) => rule.ruleType === "fracao_adicional");

  const pricing = computePricing({
    entryAt,
    exitAt,
    graceMinutes: ticket.priceTable?.graceMinutes ?? 15,
    maxDaily: ticket.priceTable?.maxDaily ? Number(ticket.priceTable.maxDaily) : null,
    couponCode: body.couponCode,
    partnerValidationCode: body.partnerValidationCode,
    firstHourValue: firstHourRule ? Number(firstHourRule.value) : undefined,
    nextHourValue: additionalFractionRule ? Number(additionalFractionRule.value) : undefined
  });

  const latestCapture = await prisma.lprCapture.findFirst({
    where: { ticketId: ticket.id, direction: "saida" },
    orderBy: { createdAt: "desc" }
  });

  const alerts =
    latestCapture && ticket.vehicle?.plate && latestCapture.plate !== ticket.vehicle.plate
      ? [{ code: "LPR_MISMATCH", message: "Leitura de placa divergente na saida" }]
      : [];

  return jsonOk({
    ticket: { code: ticket.code, status: ticket.status, stayMinutes: pricing.stayMinutes },
    pricing,
    alerts
  });
}
