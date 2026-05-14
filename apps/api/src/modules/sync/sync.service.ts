import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AgentEventBody, SyncBatchBody } from "./sync.types";

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async publishEvent(body: AgentEventBody) {
    if (!body.eventId || !body.unitId || !body.agentId || !body.eventType || !body.occurredAt) {
      throw new BadRequestException({
        success: false,
        error: {
          code: "INVALID_AGENT_EVENT_PAYLOAD",
          message: "eventId, unitId, agentId, eventType e occurredAt sao obrigatorios"
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

    let agentDeviceId: string | null = null;
    if (body.deviceId) {
      const device = await this.prisma.agentDevice.findFirst({
        where: {
          id: body.deviceId,
          agentId: body.agentId,
          unitId: body.unitId
        }
      });

      if (!device) {
        throw new NotFoundException({
          success: false,
          error: {
            code: "AGENT_DEVICE_NOT_FOUND",
            message: "Dispositivo do agente nao encontrado"
          }
        });
      }

      agentDeviceId = device.id;
    }

    const existing = await this.prisma.agentEvent.findUnique({
      where: { eventId: body.eventId }
    });

    if (existing) {
      return {
        success: true,
        data: {
          accepted: true,
          eventId: existing.eventId,
          duplicated: true
        }
      };
    }

    const event = await this.prisma.agentEvent.create({
      data: {
        eventId: body.eventId,
        agentId: body.agentId,
        unitId: body.unitId,
        agentDeviceId,
        eventType: body.eventType,
        occurredAt: new Date(body.occurredAt),
        payload: (body.payload ?? {}) as any,
        processingStatus: "processed",
        processedAt: new Date()
      }
    });

    await this.prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: "online",
        lastSeenAt: new Date()
      }
    });

    return {
      success: true,
      data: {
        accepted: true,
        eventId: event.eventId
      }
    };
  }

  async syncBatch(body: SyncBatchBody) {
    if (!body.agentId || !body.unitId || !body.batchId || !body.events?.length) {
      throw new BadRequestException({
        success: false,
        error: {
          code: "INVALID_SYNC_BATCH_PAYLOAD",
          message: "agentId, unitId, batchId e events sao obrigatorios"
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

    const existingBatch = await this.prisma.syncBatch.findUnique({
      where: {
        agentId_batchId: {
          agentId: body.agentId,
          batchId: body.batchId
        }
      },
      include: {
        items: true
      }
    });

    if (existingBatch) {
      return {
        success: true,
        data: {
          batchId: existingBatch.batchId,
          processed: existingBatch.items.filter((item) => item.status === "processed").length,
          failed: existingBatch.items.filter((item) => item.status !== "processed").length,
          results: existingBatch.items.map((item) => ({
            eventId: item.eventId,
            status: item.status.toUpperCase()
          })),
          duplicated: true
        }
      };
    }

    const batch = await this.prisma.syncBatch.create({
      data: {
        batchId: body.batchId,
        agentId: body.agentId,
        unitId: body.unitId,
        sentAt: new Date(),
        status: "processing"
      }
    });

    const results: Array<{ eventId: string; status: string }> = [];

    for (const event of body.events) {
      if (!event.eventId || !event.eventType || !event.occurredAt) {
        await this.prisma.syncBatchItem.create({
          data: {
            syncBatchId: batch.id,
            eventId: event.eventId ?? "unknown",
            status: "failed",
            errorCode: "INVALID_BATCH_EVENT",
            errorMessage: "Evento sem campos obrigatorios"
          }
        });

        results.push({
          eventId: event.eventId ?? "unknown",
          status: "FAILED"
        });
        continue;
      }

      const existingEvent = await this.prisma.agentEvent.findUnique({
        where: { eventId: event.eventId }
      });

      if (existingEvent) {
        await this.prisma.syncBatchItem.create({
          data: {
            syncBatchId: batch.id,
            agentEventId: existingEvent.id,
            eventId: event.eventId,
            status: "processed"
          }
        });

        results.push({
          eventId: event.eventId,
          status: "PROCESSED"
        });
        continue;
      }

      let agentDeviceId: string | null = null;
      if (event.deviceId) {
        const device = await this.prisma.agentDevice.findFirst({
          where: {
            id: event.deviceId,
            agentId: body.agentId,
            unitId: body.unitId
          }
        });

        if (!device) {
          await this.prisma.syncBatchItem.create({
            data: {
              syncBatchId: batch.id,
              eventId: event.eventId,
              status: "failed",
              errorCode: "AGENT_DEVICE_NOT_FOUND",
              errorMessage: "Dispositivo nao encontrado para o evento"
            }
          });

          results.push({
            eventId: event.eventId,
            status: "FAILED"
          });
          continue;
        }

        agentDeviceId = device.id;
      }

      const createdEvent = await this.prisma.agentEvent.create({
        data: {
          eventId: event.eventId,
          agentId: body.agentId,
          unitId: body.unitId,
          agentDeviceId,
          eventType: event.eventType,
          occurredAt: new Date(event.occurredAt),
          payload: (event.payload ?? {}) as any,
          processingStatus: "processed",
          processedAt: new Date()
        }
      });

      await this.prisma.syncBatchItem.create({
        data: {
          syncBatchId: batch.id,
          agentEventId: createdEvent.id,
          eventId: event.eventId,
          status: "processed"
        }
      });

      results.push({
        eventId: event.eventId,
        status: "PROCESSED"
      });
    }

    const failed = results.filter((item) => item.status !== "PROCESSED").length;

    await this.prisma.syncBatch.update({
      where: { id: batch.id },
      data: {
        processedAt: new Date(),
        status: failed > 0 ? "processed_with_errors" : "processed"
      }
    });

    await this.prisma.agent.update({
      where: { id: body.agentId },
      data: {
        status: "online",
        lastSeenAt: new Date()
      }
    });

    return {
      success: true,
      data: {
        batchId: body.batchId,
        processed: results.filter((item) => item.status === "PROCESSED").length,
        failed,
        results
      }
    };
  }
}

