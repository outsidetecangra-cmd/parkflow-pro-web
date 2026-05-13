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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const password_util_1 = require("../../common/security/password.util");
const token_util_1 = require("../../common/security/token.util");
let AuthService = class AuthService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    getTokenSecret() {
        const secret = this.configService.get("auth.jwtSecret");
        if (!secret) {
            throw new Error("JWT_SECRET ausente (auth.jwtSecret)");
        }
        return secret;
    }
    async login(body) {
        if (!body.login || !body.password) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: "INVALID_AUTH_PAYLOAD",
                    message: "Login e senha sao obrigatorios"
                }
            });
        }
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: body.login }, { username: body.login }]
            },
            include: {
                role: {
                    include: {
                        permissions: true
                    }
                },
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
        if (!user || !(0, password_util_1.verifyPassword)(body.password, user.passwordHash)) {
            throw new common_1.UnauthorizedException({
                success: false,
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Credenciais invalidas"
                }
            });
        }
        const defaultUnit = user.unitAccesses.find((access) => access.isDefault)?.unitId ??
            user.unitId ??
            user.unitAccesses[0]?.unitId;
        const secret = this.getTokenSecret();
        const now = Math.floor(Date.now() / 1000);
        const accessExp = now + 60 * 60;
        const refreshExp = now + 60 * 60 * 24 * 7;
        return {
            success: true,
            data: {
                accessToken: (0, token_util_1.encodeToken)({
                    sub: user.id,
                    type: "user",
                    role: user.role?.name,
                    unitId: defaultUnit,
                    name: user.name,
                    iat: now,
                    exp: accessExp
                }, secret),
                refreshToken: (0, token_util_1.encodeToken)({
                    sub: user.id,
                    type: "user",
                    role: user.role?.name,
                    iat: now,
                    exp: refreshExp
                }, secret),
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role?.name ?? null,
                    allowedUnitIds: user.unitAccesses.map((access) => access.unitId)
                }
            }
        };
    }
    async agentLogin(body) {
        if (!body.agentKey || !body.unitCode || !body.deviceName) {
            throw new common_1.BadRequestException({
                success: false,
                error: {
                    code: "INVALID_AGENT_AUTH_PAYLOAD",
                    message: "agentKey, unitCode e deviceName sao obrigatorios"
                }
            });
        }
        const unit = await this.prisma.unit.findUnique({
            where: { code: body.unitCode }
        });
        if (!unit) {
            throw new common_1.UnauthorizedException({
                success: false,
                error: {
                    code: "INVALID_AGENT_CREDENTIALS",
                    message: "Credenciais do agente invalidas"
                }
            });
        }
        const agent = await this.prisma.agent.findUnique({
            where: {
                unitId_name: {
                    unitId: unit.id,
                    name: body.deviceName
                }
            }
        });
        if (!agent || !(0, password_util_1.verifyPassword)(body.agentKey, agent.agentKeyHash)) {
            throw new common_1.UnauthorizedException({
                success: false,
                error: {
                    code: "INVALID_AGENT_CREDENTIALS",
                    message: "Credenciais do agente invalidas"
                }
            });
        }
        const secret = this.getTokenSecret();
        const now = Math.floor(Date.now() / 1000);
        const accessExp = now + 60 * 60;
        return {
            success: true,
            data: {
                accessToken: (0, token_util_1.encodeToken)({
                    sub: agent.id,
                    type: "agent",
                    unitId: unit.id,
                    unitCode: unit.code,
                    name: agent.name,
                    iat: now,
                    exp: accessExp
                }, secret),
                agent: {
                    id: agent.id,
                    unitId: agent.unitId,
                    name: agent.name
                }
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map