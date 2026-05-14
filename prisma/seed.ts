import { PrismaClient, TicketStatus, UserStatus } from "@prisma/client";
import { createHash } from "crypto";

function getRequiredSeedEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

const prisma = new PrismaClient();

function createSeedHash(value: string) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrador geral" },
    update: { description: "Controle total da plataforma" },
    create: {
      name: "Administrador geral",
      description: "Controle total da plataforma"
    }
  });

  await Promise.all(
    [
      { code: "ticket.entry.create", description: "Registrar entrada", roleId: adminRole.id },
      { code: "ticket.exit.confirm", description: "Confirmar saida", roleId: adminRole.id },
      { code: "cash.open", description: "Abrir caixa", roleId: adminRole.id },
      { code: "dashboard.view", description: "Visualizar dashboard", roleId: adminRole.id }
    ].map((permission) =>
      prisma.permission.upsert({
        where: { code: permission.code },
        update: {
          description: permission.description,
          roleId: permission.roleId
        },
        create: permission
      })
    )
  );

  const units = await Promise.all(
    [
      { code: "ATL", name: "Shopping Atlante", city: "Sao Paulo", state: "SP", capacity: 220 },
      { code: "AEN", name: "Aeroporto Norte", city: "Guarulhos", state: "SP", capacity: 180 },
      { code: "ARC", name: "Arena Cidade", city: "Campinas", state: "SP", capacity: 140 }
    ].map((unit) =>
      prisma.unit.upsert({
        where: { code: unit.code },
        update: unit,
        create: unit
      })
    )
  );

  const [atlUnit, aenUnit, arcUnit] = units;

  const user = await prisma.user.upsert({
    where: { email: "admin.demo@example.invalid" },
    update: {
      username: "admin",
      passwordHash: createSeedHash(getRequiredSeedEnv("SEED_ADMIN_PASSWORD")),
      name: "Admin Demo",
      status: UserStatus.ACTIVE,
      roleId: adminRole.id,
      unitId: atlUnit.id
    },
    create: {
      email: "admin.demo@example.invalid",
      username: "admin",
      passwordHash: createSeedHash(getRequiredSeedEnv("SEED_ADMIN_PASSWORD")),
      name: "Admin Demo",
      status: UserStatus.ACTIVE,
      roleId: adminRole.id,
      unitId: atlUnit.id
    }
  });

  await Promise.all(
    [
      { unitId: atlUnit.id, isDefault: true },
      { unitId: aenUnit.id, isDefault: false },
      { unitId: arcUnit.id, isDefault: false }
    ].map((access) =>
      prisma.userUnitAccess.upsert({
        where: {
          userId_unitId: {
            userId: user.id,
            unitId: access.unitId
          }
        },
        update: { isDefault: access.isDefault },
        create: {
          userId: user.id,
          unitId: access.unitId,
          isDefault: access.isDefault
        }
      })
    )
  );

  const lot = await prisma.parkingLot.upsert({
    where: { code: "ATL-P1" },
    update: {
      name: "P1 Shopping",
      unitId: atlUnit.id,
      capacity: 120
    },
    create: {
      code: "ATL-P1",
      name: "P1 Shopping",
      unitId: atlUnit.id,
      capacity: 120
    }
  });

  const priceTable = await prisma.priceTable.upsert({
    where: { id: "price-table-demo-avulso" },
    update: {
      name: "Avulso Premium",
      type: "avulso",
      unitId: atlUnit.id,
      graceMinutes: 15,
      maxDaily: 68
    },
    create: {
      id: "price-table-demo-avulso",
      name: "Avulso Premium",
      type: "avulso",
      unitId: atlUnit.id,
      graceMinutes: 15,
      maxDaily: 68
    }
  });

  const existingCustomer = await prisma.customer.findFirst({
    where: { email: "marina@example.com" }
  });

  const customer = existingCustomer
    ? await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: "Marina Costa",
          document: "00000000000",
          phone: "00000000000"
        }
      })
    : await prisma.customer.create({
        data: {
          name: "Marina Costa",
          document: "00000000000",
          email: "marina@example.com",
          phone: "00000000000"
        }
      });

  const vehicle = await prisma.vehicle.upsert({
    where: { plate: "DEMO001" },
    update: {
      model: "Jeep Compass",
      color: "Preto",
      customerId: customer.id
    },
    create: {
      plate: "DEMO001",
      model: "Jeep Compass",
      color: "Preto",
      customerId: customer.id
    }
  });

  const camera = await prisma.camera.upsert({
    where: { id: "cam-demo-atl-01" },
    update: {
      unitId: atlUnit.id,
      name: "Camera LPR Entrada Norte 01",
      type: "LPR",
      ip: "10.10.1.40"
    },
    create: {
      id: "cam-demo-atl-01",
      unitId: atlUnit.id,
      name: "Camera LPR Entrada Norte 01",
      type: "LPR",
      ip: "10.10.1.40"
    }
  });

  await prisma.gate.upsert({
    where: { id: "gate-demo-atl-01" },
    update: {
      unitId: atlUnit.id,
      name: "Cancela Entrada Norte 01",
      type: "entrada",
      ip: "10.10.1.11"
    },
    create: {
      id: "gate-demo-atl-01",
      unitId: atlUnit.id,
      name: "Cancela Entrada Norte 01",
      type: "entrada",
      ip: "10.10.1.11"
    }
  });

  await prisma.terminal.upsert({
    where: { id: "term-demo-atl-01" },
    update: {
      unitId: atlUnit.id,
      name: "Terminal Caixa 01",
      type: "PDV",
      ip: "10.10.1.60"
    },
    create: {
      id: "term-demo-atl-01",
      unitId: atlUnit.id,
      name: "Terminal Caixa 01",
      type: "PDV",
      ip: "10.10.1.60"
    }
  });

  const ticket = await prisma.ticket.upsert({
    where: { code: "TK-20260513-001" },
    update: {
      unitId: atlUnit.id,
      status: TicketStatus.OPEN,
      customerId: customer.id,
      vehicleId: vehicle.id,
      parkingLotId: lot.id,
      priceTableId: priceTable.id,
      entryAt: new Date("2026-05-13T09:15:00-03:00"),
      expectedAmount: 32,
      finalAmount: 28,
      paymentDeadline: new Date("2026-05-13T12:55:00-03:00"),
      origin: "WEB",
      qrCode: "QR-TK-20260513-001",
      notes: "Ticket seeded para demonstracao de saida."
    },
    create: {
      code: "TK-20260513-001",
      unitId: atlUnit.id,
      status: TicketStatus.OPEN,
      customerId: customer.id,
      vehicleId: vehicle.id,
      parkingLotId: lot.id,
      priceTableId: priceTable.id,
      entryAt: new Date("2026-05-13T09:15:00-03:00"),
      expectedAmount: 32,
      finalAmount: 28,
      paymentDeadline: new Date("2026-05-13T12:55:00-03:00"),
      origin: "WEB",
      qrCode: "QR-TK-20260513-001",
      notes: "Ticket seeded para demonstracao de saida."
    }
  });

  await prisma.movement.upsert({
    where: { id: "mov-demo-entry-01" },
    update: {
      ticketId: ticket.id,
      userId: user.id,
      type: "ENTRY_REGISTERED",
      payload: { gate: "Entrada Norte 01", ocr: "DEMO001", origin: "WEB" }
    },
    create: {
      id: "mov-demo-entry-01",
      ticketId: ticket.id,
      userId: user.id,
      type: "ENTRY_REGISTERED",
      payload: { gate: "Entrada Norte 01", ocr: "DEMO001", origin: "WEB" }
    }
  });

  await prisma.payment.upsert({
    where: { id: "pay-demo-ticket-01" },
    update: {
      ticketId: ticket.id,
      unitId: atlUnit.id,
      method: "Pix",
      amount: 28,
      status: "pending",
      reference: "pix_demo_001",
      origin: "WEB",
      paidAt: null,
      metadata: { simulated: true }
    },
    create: {
      id: "pay-demo-ticket-01",
      ticketId: ticket.id,
      unitId: atlUnit.id,
      method: "Pix",
      amount: 28,
      status: "pending",
      reference: "pix_demo_001",
      origin: "WEB",
      paidAt: null,
      metadata: { simulated: true }
    }
  });

  await prisma.lprCapture.upsert({
    where: { id: "lpr-demo-01" },
    update: {
      ticketId: ticket.id,
      cameraId: camera.id,
      unitId: atlUnit.id,
      plate: "DEMO001",
      confidence: 97.8,
      direction: "entrada",
      status: "validado",
      imageUrl: "local://capture-001.jpg"
    },
    create: {
      id: "lpr-demo-01",
      ticketId: ticket.id,
      cameraId: camera.id,
      unitId: atlUnit.id,
      plate: "DEMO001",
      confidence: 97.8,
      direction: "entrada",
      status: "validado",
      imageUrl: "local://capture-001.jpg"
    }
  });

  const agent = await prisma.agent.upsert({
    where: {
      unitId_name: {
        unitId: atlUnit.id,
        name: "agent-atl-01"
      }
    },
    update: {
      agentKeyHash: createSeedHash(getRequiredSeedEnv("SEED_AGENT_SECRET")),
      status: "online",
      version: "0.1.0",
      lastSeenAt: new Date("2026-05-13T12:50:00-03:00")
    },
    create: {
      unitId: atlUnit.id,
      name: "agent-atl-01",
      agentKeyHash: createSeedHash(getRequiredSeedEnv("SEED_AGENT_SECRET")),
      status: "online",
      version: "0.1.0",
      lastSeenAt: new Date("2026-05-13T12:50:00-03:00")
    }
  });

  const agentDevice = await prisma.agentDevice.upsert({
    where: { id: "agent-device-camera-01" },
    update: {
      id: "agent-device-camera-01",
      unitId: atlUnit.id,
      agentId: agent.id,
      deviceType: "CAMERA",
      name: "Camera LPR Entrada Norte 01",
      externalIdentifier: "cam_lpr_entrada_01",
      status: "online",
      lastSignalAt: new Date("2026-05-13T12:49:57-03:00"),
      metadata: { ip: "10.10.1.40", mappedCameraId: camera.id }
    },
    create: {
      id: "agent-device-camera-01",
      agentId: agent.id,
      unitId: atlUnit.id,
      deviceType: "CAMERA",
      name: "Camera LPR Entrada Norte 01",
      externalIdentifier: "cam_lpr_entrada_01",
      status: "online",
      lastSignalAt: new Date("2026-05-13T12:49:57-03:00"),
      metadata: { ip: "10.10.1.40", mappedCameraId: camera.id }
    }
  });

  await prisma.agentDevice.upsert({
    where: { id: "agent-device-ocr-01" },
    update: {
      id: "agent-device-ocr-01",
      agentId: agent.id,
      unitId: atlUnit.id,
      deviceType: "OCR",
      name: "OCR Virtual Entrada 01",
      externalIdentifier: "ocr_virtual_entrada_01",
      status: "online",
      lastSignalAt: new Date("2026-05-13T12:49:58-03:00"),
      metadata: { provider: "mock", linkedCameraId: camera.id }
    },
    create: {
      id: "agent-device-ocr-01",
      agentId: agent.id,
      unitId: atlUnit.id,
      deviceType: "OCR",
      name: "OCR Virtual Entrada 01",
      externalIdentifier: "ocr_virtual_entrada_01",
      status: "online",
      lastSignalAt: new Date("2026-05-13T12:49:58-03:00"),
      metadata: { provider: "mock", linkedCameraId: camera.id }
    }
  });

  const agentEvent = await prisma.agentEvent.upsert({
    where: { eventId: "evt_demo_001" },
    update: {
      agentId: agent.id,
      unitId: atlUnit.id,
      agentDeviceId: agentDevice.id,
      eventType: "LPR_CAPTURED",
      occurredAt: new Date("2026-05-13T12:39:41-03:00"),
      payload: {
        ticketCode: "TK-20260513-001",
        plate: "DEMO001",
        confidence: 97.8
      },
      processingStatus: "processed",
      processedAt: new Date("2026-05-13T12:39:42-03:00")
    },
    create: {
      eventId: "evt_demo_001",
      agentId: agent.id,
      unitId: atlUnit.id,
      agentDeviceId: agentDevice.id,
      eventType: "LPR_CAPTURED",
      occurredAt: new Date("2026-05-13T12:39:41-03:00"),
      payload: {
        ticketCode: "TK-20260513-001",
        plate: "DEMO001",
        confidence: 97.8
      },
      processingStatus: "processed",
      processedAt: new Date("2026-05-13T12:39:42-03:00")
    }
  });

  const syncBatch = await prisma.syncBatch.upsert({
    where: {
      agentId_batchId: {
        agentId: agent.id,
        batchId: "batch_demo_001"
      }
    },
    update: {
      unitId: atlUnit.id,
      sentAt: new Date("2026-05-13T12:40:00-03:00"),
      processedAt: new Date("2026-05-13T12:40:03-03:00"),
      status: "processed"
    },
    create: {
      agentId: agent.id,
      batchId: "batch_demo_001",
      unitId: atlUnit.id,
      sentAt: new Date("2026-05-13T12:40:00-03:00"),
      processedAt: new Date("2026-05-13T12:40:03-03:00"),
      status: "processed"
    }
  });

  await prisma.syncBatchItem.upsert({
    where: { id: "sync-item-demo-001" },
    update: {
      syncBatchId: syncBatch.id,
      agentEventId: agentEvent.id,
      eventId: "evt_demo_001",
      status: "processed",
      errorCode: null,
      errorMessage: null
    },
    create: {
      id: "sync-item-demo-001",
      syncBatchId: syncBatch.id,
      agentEventId: agentEvent.id,
      eventId: "evt_demo_001",
      status: "processed",
      errorCode: null,
      errorMessage: null
    }
  });

  console.log(
    "Seed concluido com unidades, multiunidade de usuario, ticket operacional e nucleo inicial do agente local."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



