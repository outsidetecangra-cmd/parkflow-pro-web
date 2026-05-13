import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: { ticketCode?: string; plate?: string; qrCode?: string }) {
    if (!query.ticketCode && !query.plate && !query.qrCode) {
      throw new BadRequestException({
        success: false,
        error: {
          code: "INVALID_TICKET_QUERY",
          message: "Informe ticketCode, plate ou qrCode"
        }
      });
    }

    const filters: Array<Record<string, unknown>> = [];
    if (query.ticketCode) filters.push({ code: query.ticketCode });
    if (query.qrCode) filters.push({ qrCode: query.qrCode });
    if (query.plate) filters.push({ vehicle: { plate: query.plate } });

    const ticket = await this.prisma.ticket.findFirst({
      where: {
        OR: filters
      },
      include: {
        customer: true,
        vehicle: true,
        parkingLot: true,
        priceTable: true,
        payments: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });

    if (!ticket) {
      throw new NotFoundException({
        success: false,
        error: {
          code: "TICKET_NOT_FOUND",
          message: "Ticket nao encontrado"
        }
      });
    }

    const latestPayment = ticket.payments[0] ?? null;

    return {
      success: true,
      data: {
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
          paymentStatus: latestPayment?.status?.toUpperCase() ?? "PENDING",
          validationStatus: latestPayment ? "PAYMENT_REGISTERED" : "NOT_VALIDATED"
        }
      }
    };
  }
}
