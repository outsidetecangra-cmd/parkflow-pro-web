import { jsonError, jsonOk } from "@/lib/server/http";
import { getPrismaClient } from "@/lib/server/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-store"
    }
  });
}

async function getPricingConfig() {
  const prisma = getPrismaClient();

  let priceTable = await prisma.priceTable.findFirst({
    where: { active: true },
    include: { rules: true }
  });

  if (!priceTable) {
    priceTable = await prisma.priceTable.findFirst({
      include: { rules: true }
    });
  }

  if (!priceTable) {
    const created = await prisma.priceTable.create({
      data: { name: "Tabela Padrao", type: "PADRAO", active: true, graceMinutes: 15, maxDaily: null }
    });

    await prisma.priceRule.createMany({
      data: [
        { priceTableId: created.id, name: "Primeira Hora", ruleType: "primeira_hora", value: 12 },
        { priceTableId: created.id, name: "Fracao Adicional (Hora)", ruleType: "fracao_adicional", value: 6 }
      ]
    });

    priceTable = await prisma.priceTable.findUnique({ where: { id: created.id }, include: { rules: true } });
  }

  if (!priceTable) throw new Error("Nenhuma tabela de precos encontrada");

  const firstHourRule = priceTable.rules.find((rule) => rule.ruleType === "primeira_hora");
  const additionalFractionRule = priceTable.rules.find((rule) => rule.ruleType === "fracao_adicional");

  return {
    priceTableId: priceTable.id,
    name: priceTable.name,
    graceMinutes: priceTable.graceMinutes,
    maxDaily: priceTable.maxDaily ? Number(priceTable.maxDaily) : null,
    firstHour: firstHourRule ? Number(firstHourRule.value) : 12,
    additionalFraction: additionalFractionRule ? Number(additionalFractionRule.value) : 6
  };
}

async function updatePricingConfig(bodyText: string) {
  if (!process.env.DATABASE_URL) {
    return jsonError("DATABASE_URL ausente no ambiente (Vercel).", 500, "MISSING_DATABASE_URL");
  }

  const parsed = JSON.parse(bodyText) as {
    firstHour?: number;
    additionalFraction?: number;
    graceMinutes?: number;
    maxDaily?: number | null;
  };

  const prisma = getPrismaClient();
  let priceTable = await prisma.priceTable.findFirst({ where: { active: true } });

  if (!priceTable) {
    priceTable = await prisma.priceTable.create({
      data: {
        name: "Tabela Padrao",
        type: "PADRAO",
        active: true,
        graceMinutes: typeof parsed.graceMinutes === "number" ? parsed.graceMinutes : 15,
        maxDaily: parsed.maxDaily === null || typeof parsed.maxDaily === "number" ? parsed.maxDaily : null
      }
    });
  } else {
    await prisma.priceTable.update({
      where: { id: priceTable.id },
      data: {
        graceMinutes: typeof parsed.graceMinutes === "number" ? parsed.graceMinutes : priceTable.graceMinutes,
        maxDaily: parsed.maxDaily === null || typeof parsed.maxDaily === "number" ? parsed.maxDaily : priceTable.maxDaily
      }
    });
  }

  if (typeof parsed.firstHour === "number") {
    const existing = await prisma.priceRule.findFirst({
      where: { priceTableId: priceTable.id, ruleType: "primeira_hora" }
    });
    if (existing) {
      await prisma.priceRule.update({ where: { id: existing.id }, data: { value: parsed.firstHour } });
    } else {
      await prisma.priceRule.create({
        data: { priceTableId: priceTable.id, name: "Primeira Hora", ruleType: "primeira_hora", value: parsed.firstHour }
      });
    }
  }

  if (typeof parsed.additionalFraction === "number") {
    const existing = await prisma.priceRule.findFirst({
      where: { priceTableId: priceTable.id, ruleType: "fracao_adicional" }
    });
    if (existing) {
      await prisma.priceRule.update({ where: { id: existing.id }, data: { value: parsed.additionalFraction } });
    } else {
      await prisma.priceRule.create({
        data: {
          priceTableId: priceTable.id,
          name: "Fracao Adicional (Hora)",
          ruleType: "fracao_adicional",
          value: parsed.additionalFraction
        }
      });
    }
  }

  return jsonOk({ message: "Configuracoes de preco atualizadas com sucesso" });
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return jsonError("DATABASE_URL ausente no ambiente (Vercel).", 500, "MISSING_DATABASE_URL");
    }

    return jsonOk(await getPricingConfig());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao buscar precificacao.";
    return jsonError(message, 502, "PRICING_UNAVAILABLE");
  }
}

async function updateHandler(request: Request) {
  const bodyText = await request.text();

  try {
    return await updatePricingConfig(bodyText);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao atualizar precificacao.";
    return jsonError(message, 502, "PRICING_UNAVAILABLE");
  }
}

export async function PUT(request: Request) {
  return updateHandler(request);
}

export async function POST(request: Request) {
  return updateHandler(request);
}

export async function PATCH(request: Request) {
  return updateHandler(request);
}

