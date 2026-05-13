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
exports.OperationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let OperationsService = class OperationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateTicketCode() {
        return `TK-${Date.now()}`;
    }
    generateQrCode(ticketCode) {
        return `QR-${ticketCode}`;
    }
    computePricing(input) {
        const diffMs = Math.max(0, input.exitAt.getTime() - input.entryAt.getTime());
        const stayMinutes = Math.ceil(diffMs / 60000);
        if (stayMinutes <= input.graceMinutes) {
            return {
                stayMinutes,
                originalAmount: 0,
                discountAmount: input.manualDiscount ?? 0,
                extraAmount: 0,
                finalAmount: 0,
                appliedRules: ["tolerancia inicial"]
            };
        }
        const billableMinutes = stayMinutes - input.graceMinutes;
        const billableHours = Math.ceil(billableMinutes / 60);
        const firstHour = 12;
        const nextHours = Math.max(0, billableHours - 1) * 6;
        let originalAmount = firstHour + nextHours;
        if (input.maxDaily) {
            originalAmount = Math.min(originalAmount, input.maxDaily);
        }
        const automaticDiscount = input.manualDiscount ??
            (input.couponCode || input.partnerValidationCode ? 4 : 0);
        const finalAmount = Math.max(0, originalAmount - automaticDiscount);
        return {
            stayMinutes,
            originalAmount,
            discountAmount: automaticDiscount,
            extraAmount: 0,
            finalAmount,
            appliedRules: [
                "1a hora",
                billableHours > 1 ? `${billableHours - 1} fracoes adicionais` : "sem fracoes adicionais",
                automaticDiscount > 0 ? "desconto aplicado" : "sem desconto"
            ]
        };
    }
    async createEntry(body) {
        if (!body.unitId || !body.plate || !body.yardId || !body.priceTableId) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: "INVALID_ENTRY_PAYLOAD",
                    message: "unitId, plate, yardId e priceTableId sao obrigatorios"
                }
            });
        }
        const [unit, parkingLot, priceTable, existingVehicle] = await Promise.all([
            this.prisma.unit.findUnique({ where: { id: body.unitId } }),
            this.prisma.parkingLot.findUnique({ where: { id: body.yardId } }),
            this.prisma.priceTable.findUnique({ where: { id: body.priceTableId } }),
            this.prisma.vehicle.findUnique({
                where: { plate: body.plate },
                include: {
                    customer: {
                        include: {
                            monthlyCustomer: true
                        }
                    }
                }
            })
        ]);
        if (!unit || !parkingLot || !priceTable) {
            throw new common_1.NotFoundException({
                success: false,
                error: {
                    code: "ENTRY_DEPENDENCY_NOT_FOUND",
                    message: "Unidade, patio ou tabela de preco nao encontrados"
                }
            });
        }
        if (parkingLot.unitId !== unit.id || (priceTable.unitId && priceTable.unitId !== unit.id)) {
            throw new common_1.ForbiddenException({
                success: false,
                error: {
                    code: "UNIT_SCOPE_MISMATCH",
                    message: "Patio ou tabela de preco nao pertencem a unidade informada"
                }
            });
        }
        const openTicket = await this.prisma.ticket.findFirst({
            where: {
                status: "OPEN",
                vehicle: {
                    plate: body.plate
                }
            }
        });
        if (openTicket) {
            throw new common_1.ForbiddenException({
                success: false,
                error: {
                    code: "OPEN_TICKET_ALREADY_EXISTS",
                    message: "A placa ja possui uma entrada em aberto"
                }
            });
        }
        const credential = await this.prisma.credential.findFirst({
            where: {
                plate: body.plate
            },
            orderBy: {
                validUntil: "desc"
            }
        });
        if (credential?.validUntil && credential.validUntil < new Date()) {
            throw new common_1.ForbiddenException({
                success: false,
                error: {
                    code: "EXPIRED_CREDENTIAL",
                    message: "Credencial vencida"
                }
            });
        }
        if (existingVehicle?.customer?.monthlyCustomer?.status === "inadimplente") {
            throw new common_1.ForbiddenException({
                success: false,
                error: {
                    code: "MONTHLY_CUSTOMER_IN_DEFAULT",
                    message: "Mensalista inadimplente bloqueado para entrada"
                }
            });
        }
        const vehicle = existingVehicle ??
            (await this.prisma.vehicle.create({
                data: {
                    plate: body.plate,
                    model: body.vehicleModel ?? "Nao informado",
                    color: body.vehicleColor ?? null
                }
            }));
        const ticketCode = this.generateTicketCode();
        const qrCode = this.generateQrCode(ticketCode);
        const entryAt = new Date();
        const ticket = await this.prisma.ticket.create({
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
        await this.prisma.movement.create({
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
            await this.prisma.lprCapture.create({
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
        return {
            success: true,
            data: {
                ticket: {
                    id: ticket.id,
                    code: ticket.code,
                    status: ticket.status,
                    entryAt: ticket.entryAt,
                    qrCode: ticket.qrCode
                },
                gateAction: {
                    allowed: true,
                    reason: null
                }
            }
        };
    }
    async calculateExit(body) {
        if (!body.ticketCode) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: "INVALID_EXIT_CALCULATION_PAYLOAD",
                    message: "ticketCode e obrigatorio"
                }
            });
        }
        const ticket = await this.prisma.ticket.findUnique({
            where: { code: body.ticketCode },
            include: {
                vehicle: true,
                priceTable: true
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
        if (ticket.unitId && ticket.unitId !== body.unitId) {
            throw new common_1.ForbiddenException({
                success: false,
                error: {
                    code: "UNIT_SCOPE_MISMATCH",
                    message: "O ticket nao pertence a unidade informada"
                }
            });
        }
        const exitAt = body.exitAt ? new Date(body.exitAt) : new Date();
        const pricing = this.computePricing({
            entryAt: ticket.entryAt,
            exitAt,
            graceMinutes: ticket.priceTable?.graceMinutes ?? 15,
            maxDaily: ticket.priceTable?.maxDaily ? Number(ticket.priceTable.maxDaily) : null,
            couponCode: body.couponCode,
            partnerValidationCode: body.partnerValidationCode
        });
        const latestCapture = await this.prisma.lprCapture.findFirst({
            where: {
                ticketId: ticket.id,
                direction: "saida"
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        const alerts = latestCapture && ticket.vehicle?.plate && latestCapture.plate !== ticket.vehicle.plate
            ? [
                {
                    code: "LPR_MISMATCH",
                    message: "Leitura de placa divergente na saida"
                }
            ]
            : [];
        return {
            success: true,
            data: {
                ticket: {
                    code: ticket.code,
                    status: ticket.status,
                    stayMinutes: pricing.stayMinutes
                },
                pricing,
                alerts
            }
        };
    }
    async confirmExit(body) {
        if (!body.ticketCode || !body.unitId || !body.exitAt) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: "INVALID_EXIT_CONFIRM_PAYLOAD",
                    message: "ticketCode, unitId e exitAt sao obrigatorios"
                }
            });
        }
        const ticket = await this.prisma.ticket.findUnique({
            where: { code: body.ticketCode },
            include: {
                vehicle: true,
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
        const exitAt = new Date(body.exitAt);
        const manualDiscount = body.discount?.amount ?? 0;
        const pricing = this.computePricing({
            entryAt: ticket.entryAt,
            exitAt,
            graceMinutes: ticket.priceTable?.graceMinutes ?? 15,
            maxDaily: ticket.priceTable?.maxDaily ? Number(ticket.priceTable.maxDaily) : null,
            manualDiscount
        });
        const canExitWithoutPayment = ticket.status === "EXEMPT";
        const paymentStatus = body.payment?.status?.toUpperCase();
        if (!canExitWithoutPayment && paymentStatus !== "APPROVED") {
            throw new common_1.ForbiddenException({
                success: false,
                error: {
                    code: "PAYMENT_REQUIRED",
                    message: "A saida exige pagamento aprovado, isencao ou regra valida"
                }
            });
        }
        const lprMismatch = !!body.lpr?.plate && !!ticket.vehicle?.plate && body.lpr.plate !== ticket.vehicle.plate;
        const result = await this.prisma.$transaction(async (tx) => {
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
            const latestPayment = ticket.payments[0];
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
                            metadata: {
                                discountReason: body.discount?.reason ?? null
                            }
                        }
                    });
                }
                else {
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
                            metadata: {
                                discountReason: body.discount?.reason ?? null
                            }
                        }
                    });
                }
            }
            await tx.movement.create({
                data: {
                    ticketId: ticket.id,
                    type: "EXIT_CONFIRMED",
                    payload: {
                        gateId: body.gateId ?? null,
                        discount: body.discount ?? null,
                        payment: body.payment ?? null,
                        lpr: body.lpr ?? null
                    }
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
            return {
                ticket: updatedTicket,
                auditCreated
            };
        });
        return {
            success: true,
            data: {
                ticket: {
                    code: result.ticket.code,
                    status: result.ticket.status,
                    finalAmount: Number(result.ticket.finalAmount ?? pricing.finalAmount)
                },
                gateAction: {
                    allowed: true,
                    command: "OPEN"
                },
                audit: {
                    occurrenceCreated: result.auditCreated,
                    reason: result.auditCreated ? "LPR_MISMATCH" : null
                }
            }
        };
    }
};
exports.OperationsService = OperationsService;
exports.OperationsService = OperationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OperationsService);
//# sourceMappingURL=operations.service.js.map