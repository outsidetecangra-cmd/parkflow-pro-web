import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DeviceStatusBody } from "./devices.types";

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatus(body: DeviceStatusBody) {
    if (!body.agentId || !body.unitId || !body.devices?.length) {
      throw new BadRequestException({
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
      throw new NotFoundException({
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
}

