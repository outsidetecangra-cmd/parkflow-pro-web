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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DevicesService = class DevicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateStatus(body) {
        if (!body.agentId || !body.unitId || !body.devices?.length) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: "INVALID_DEVICE_STATUS_PAYLOAD",
                    message: "agentId, unitId e devices sao obrigatorios"
                }
            });
        }
        const agent = await this.prisma.agent.findFirst({
            where: {
                id: body.agentId,
                unitId: body.unitId
            }
        });
        if (!agent) {
            throw new common_1.NotFoundException({
                success: false,
                error: {
                    code: "AGENT_NOT_FOUND",
                    message: "Agente nao encontrado para a unidade informada"
                }
            });
        }
        let received = 0;
        for (const deviceStatus of body.devices) {
            if (!deviceStatus.deviceId) {
                continue;
            }
            const device = await this.prisma.agentDevice.findFirst({
                where: {
                    id: deviceStatus.deviceId,
                    agentId: body.agentId,
                    unitId: body.unitId
                }
            });
            if (!device) {
                continue;
            }
            await this.prisma.agentDevice.update({
                where: { id: device.id },
                data: {
                    status: deviceStatus.status?.toLowerCase() ?? device.status,
                    lastSignalAt: deviceStatus.lastSignalAt ? new Date(deviceStatus.lastSignalAt) : new Date()
                }
            });
            received += 1;
        }
        await this.prisma.agent.update({
            where: { id: body.agentId },
            data: {
                status: "online",
                lastSeenAt: body.sentAt ? new Date(body.sentAt) : new Date()
            }
        });
        return {
            success: true,
            data: {
                received
            }
        };
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevicesService);
//# sourceMappingURL=devices.service.js.map