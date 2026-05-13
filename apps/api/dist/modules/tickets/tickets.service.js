"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(query) {
        if (!query.ticketCode && !query.plate && !query.qrCode) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: "INVALID_TICKET_QUERY",
                    message: "Informe ticketCode, plate ou qrCode"
                }
            });
        }
        const filters = [];
        if (query.ticketCode)
            filters.push({ code: query.ticketCode });
        if (query.qrCode)
            filters.push({ qrCode: query.qrCode });
        if (query.plate)
            filters.push({ vehicle: { plate: query.plate } });
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
            throw new common_1.NotFoundException({
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
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map