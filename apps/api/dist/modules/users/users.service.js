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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const token_util_1 = require("../../common/security/token.util");
let UsersService = class UsersService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async getContext(authorization) {
        const secret = this.configService.get("auth.jwtSecret");
        const payload = secret ? (0, token_util_1.decodeToken)((0, token_util_1.getBearerToken)(authorization), secret) : null;
        if (!payload || payload.type !== "user") {
            throw new common_1.UnauthorizedException({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Token invalido ou ausente"
                }
            });
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                role: {
                    include: {
                        permissions: true
                    }
                },
                unit: true,
                unitAccesses: {
                    include: {
                        unit: true
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        });
        if (!user) {
            throw new common_1.UnauthorizedException({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Usuario nao encontrado"
                }
            });
        }
        const activeUnit = user.unitAccesses.find((access) => access.isDefault)?.unit ??
            user.unitAccesses[0]?.unit ??
            user.unit ??
            null;
        const unitDefaults = activeUnit
            ? await this.prisma.unit.findUnique({
                where: { id: activeUnit.id },
                include: {
                    parkingLots: {
                        orderBy: { name: "asc" },
                        take: 1
                    },
                    priceTables: {
                        where: { active: true },
                        orderBy: { name: "asc" },
                        take: 1
                    },
                    cameras: {
                        orderBy: { name: "asc" },
                        take: 1
                    },
                    terminals: {
                        orderBy: { name: "asc" },
                        take: 1
                    }
                }
            })
            : null;
        const parkingLot = unitDefaults?.parkingLots[0] ?? null;
        const priceTable = unitDefaults?.priceTables[0] ?? null;
        const camera = unitDefaults?.cameras[0] ?? null;
        const terminal = unitDefaults?.terminals[0] ?? null;
        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role?.name ?? null
                },
                activeUnit: activeUnit
                    ? {
                        id: activeUnit.id,
                        name: activeUnit.name
                    }
                    : null,
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
            }
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map