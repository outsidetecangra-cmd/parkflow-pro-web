import { computePricing } from "@/app/api/operations/_shared";
import { requireUser } from "@/lib/server/auth";
import { jsonError, jsonOk } from "@/lib/server/http";
import { getPrismaClient } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return jsonError(auth.error.message, auth.error.status, auth.error.code);

  let body: {
    ticketCode?: string;
    unitId?: string;
    exitAt?: string;
    payment?: { method?: string; amount?: number; status?: string; reference?: string };
    discount?: { amount?: number; reason?: string };
    lpr?: { plate?: string; confidence?: number };
    gateId?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Payload invÃ¡lido", 400, "INVALID_EXIT_CONFIRM_PAYLOAD");
  }

  if (!body.ticketCode || !body.unitId || !body.exitAt) {
    return jsonError("ticketCode, unitId e exitAt sao obrigatorios", 400, "INVALID_EXIT_CONFIRM_PAYLOAD");
  }

  const prisma = getPrismaClient();

  const ticket = await prisma.ticket.findUnique({
    where: { code: body.ticketCode },
    include: {
      vehicle: true,
      priceTable: { include: { rules: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!ticket) return jsonError("Ticket nao encontrado", 404, "TICKET_NOT_FOUND");

  const exitAt = new Date(body.exitAt);
  const manualDiscount = body.discount?.amount ?? 0;

  const firstHourRule = ticket.priceTable?.rules?.find((rule) => rule.ruleType === "primeira_hora");
  const additionalFractionRule = ticket.priceTable?.rules?.find((rule) => rule.ruleType === "fracao_adicional");

  const pricing = computePricing({
    entryAt: ticket.entryAt,
    exitAt,
    graceMinutes: ticket.priceTable?.graceMinutes ?? 15,
    maxDaily: ticket.priceTable?.maxDaily ? Number(ticket.priceTable.maxDaily) : null,
    manualDiscount,
    firstHourValue: firstHourRule ? Number(firstHourRule.value) : undefined,
    nextHourValue: additionalFractionRule ? Number(additionalFractionRule.value) : undefined
  });

  const canExitWithoutPayment = ticket.status === "EXEMPT";
  const paymentStatus = body.payment?.status?.toUpperCase();
  if (!canExitWithoutPayment && paymentStatus !== "APPROVED") {
    return jsonError("A saida exige pagamento aprovado, isencao ou regra valida", 403, "PAYMENT_REQUIRED");
  }

  const lprMismatch = !!body.lpr?.plate && !!ticket.vehicle?.plate && body.lpr.plate !== ticket.vehicle.plate;

  const result = await prisma.$transaction(async (tx) => {
    const updatedTicket = await tx.ticket.update({
      where: { id: ticket.id },
      data: {
        unitId: body.unitId,
        status: "PAID",
        exitAt,
        expectedAmount: pricing.originalAmount,
        finalAmount: pricing.finalAmount,
        paymentDeadline: new Date(exitAt.getTime() + 15 * 60000)
      }
    });

    const latestPayment = ticket.payments[0] ?? null;
    if (body.payment?.method && body.payment.amount !== undefined) {
      if (latestPayment) {
        await tx.payment.update({
          where: { id: latestPayment.id },
          data: {
            unitId: body.unitId,
            method: body.payment.method,
            amount: body.payment.amount,
            status: body.payment.status?.toLowerCase() ?? "approved",
            reference: body.payment.reference ?? null,
            origin: "WEB",
            paidAt: paymentStatus === "APPROVED" ? exitAt : null,
            metadata: { discountReason: body.discount?.reason ?? null }
          }
        });
      } else {
        await tx.payment.create({
          data: {
            ticketId: ticket.id,
            unitId: body.unitId,
            method: body.payment.method,
            amount: body.payment.amount,
            status: body.payment.status?.toLowerCase() ?? "approved",
            reference: body.payment.reference ?? null,
            origin: "WEB",
            paidAt: paymentStatus === "APPROVED" ? exitAt : null,
            metadata: { discountReason: body.discount?.reason ?? null }
          }
        });
      }
    }

    await tx.movement.create({
      data: {
        ticketId: ticket.id,
        type: "EXIT_CONFIRMED",
        payload: { gateId: body.gateId ?? null, discount: body.discount ?? null, payment: body.payment ?? null, lpr: body.lpr ?? null }
      }
    });

    if (body.lpr?.plate) {
      await tx.lprCapture.create({
        data: {
          ticketId: ticket.id,
          unitId: body.unitId,
          plate: body.lpr.plate,
          confidence: body.lpr.confidence ?? 0,
          direction: "saida",
          status: lprMismatch ? "divergente" : "validado"
        }
      });
    }

    let auditCreated = false;
    if (lprMismatch) {
      await tx.auditOccurrence.create({
        data: {
          unitId: body.unitId,
          type: "Placa divergente",
          severity: "alta",
          plate: body.lpr?.plate ?? null,
          ticketCode: ticket.code,
          status: "aberta",
          comment: "Leitura de placa divergente na confirmacao da saida."
        }
      });
      auditCreated = true;
    }

    return { ticket: updatedTicket, auditCreated };
  });

  return jsonOk({
    ticket: { code: result.ticket.code, status: result.ticket.status, finalAmount: Number(result.ticket.finalAmount ?? pricing.finalAmount) },
    gateAction: { allowed: true, command: "OPEN" },
    audit: { occurrenceCreated: result.auditCreated, reason: result.auditCreated ? "LPR_MISMATCH" : null }
  });
}
