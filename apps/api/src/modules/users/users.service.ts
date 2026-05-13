import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { decodeToken, getBearerToken } from "../../common/security/token.util";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async getContext(authorization?: string) {
    const secret = this.configService.get<string>("auth.jwtSecret");
    const payload = secret ? decodeToken(getBearerToken(authorization), secret) : null;

    if (!payload || payload.type !== "user") {
      throw new UnauthorizedException({
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
      throw new UnauthorizedException({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Usuario nao encontrado"
        }
      });
    }

    const activeUnit =
      user.unitAccesses.find((access) => access.isDefault)?.unit ??
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
}
