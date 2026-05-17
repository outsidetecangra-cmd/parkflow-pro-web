import { jsonError, jsonOk } from "@/lib/server/http";
import { getPrismaClient } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketCode = searchParams.get("ticketCode") ?? undefined;
  const plate = searchParams.get("plate") ?? undefined;
  const qrCode = searchParams.get("qrCode") ?? undefined;

  if (!ticketCode && !plate && !qrCode) {
    return jsonError("Informe ticketCode, plate ou qrCode", 400, "INVALID_TICKET_QUERY");
  }

  const prisma = getPrismaClient();

  const filters: Array<Record<string, unknown>> = [];
  if (ticketCode) filters.push({ code: ticketCode });
  if (qrCode) filters.push({ qrCode });
  if (plate) filters.push({ vehicle: { plate } });

  const ticket = await prisma.ticket.findFirst({
    where: { OR: filters },
    include: {
      customer: true,
      vehicle: true,
      parkingLot: true,
      priceTable: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!ticket) return jsonError("Ticket nao encontrado", 404, "TICKET_NOT_FOUND");

  const latestPayment = ticket.payments[0] ?? null;

  return jsonOk({
    ticket: {
      id: ticket.id,
      code: ticket.code,
      status: ticket.status,
      type: "AVULSO",
      plate: ticket.vehicle?.plate ?? null,
      vehicleModel: ticket.vehicle?.model ?? null,
      customerName: ticket.customer?.name ?? null,
      entryAt: ticket.entryAt,
      yardName: ticket.parkingLot?.name ?? null,
      spotCode: null,
      priceTableName: ticket.priceTable?.name ?? null,
      paymentStatus: latestPayment?.status?.toUpperCase?.() ? latestPayment.status.toUpperCase() : "PENDING",
      validationStatus: latestPayment ? "PAYMENT_REGISTERED" : "NOT_VALIDATED"
    }
  });
}
