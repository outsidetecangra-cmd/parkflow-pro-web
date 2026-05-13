import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { verifyPassword } from "../../common/security/password.util";
import { encodeToken } from "../../common/security/token.util";
import { AgentLoginBody, LoginBody } from "./auth.types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  private getTokenSecret() {
    const secret = this.configService.get<string>("auth.jwtSecret");
    if (!secret) {
      throw new Error("JWT_SECRET ausente (auth.jwtSecret)");
    }
    return secret;
  }

  async login(body: LoginBody) {
    if (!body.login || !body.password) {
      throw new BadRequestException({
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

    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Credenciais invalidas"
        }
      });
    }

    const defaultUnit =
      user.unitAccesses.find((access) => access.isDefault)?.unitId ??
      user.unitId ??
      user.unitAccesses[0]?.unitId;

    const secret = this.getTokenSecret();
    const now = Math.floor(Date.now() / 1000);
    const accessExp = now + 60 * 60; // 1h
    const refreshExp = now + 60 * 60 * 24 * 7; // 7d

    return {
      success: true,
      data: {
        accessToken: encodeToken({
          sub: user.id,
          type: "user",
          role: user.role?.name,
          unitId: defaultUnit,
          name: user.name,
          iat: now,
          exp: accessExp
        }, secret),
        refreshToken: encodeToken({
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

  async agentLogin(body: AgentLoginBody) {
    if (!body.agentKey || !body.unitCode || !body.deviceName) {
      throw new BadRequestException({
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
      throw new UnauthorizedException({
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

    if (!agent || !verifyPassword(body.agentKey, agent.agentKeyHash)) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: "INVALID_AGENT_CREDENTIALS",
          message: "Credenciais do agente invalidas"
        }
      });
    }

    const secret = this.getTokenSecret();
    const now = Math.floor(Date.now() / 1000);
    const accessExp = now + 60 * 60; // 1h

    return {
      success: true,
      data: {
        accessToken: encodeToken({
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
}
