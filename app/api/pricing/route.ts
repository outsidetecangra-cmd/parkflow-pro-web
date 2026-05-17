import { jsonError, jsonOk } from "@/lib/server/http";
import { getPrismaClient } from "@/lib/server/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001/api";

function buildUrl(pathname: string) {
  return `${API_BASE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
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
      data: { name: "Tabela PadrÃ£o", type: "PADRAO", active: true, graceMinutes: 15, maxDaily: null }
    });

    await prisma.priceRule.createMany({
      data: [
        { priceTableId: created.id, name: "Primeira Hora", ruleType: "primeira_hora", value: 12 },
        { priceTableId: created.id, name: "FraÃ§Ã£o Adicional (Hora)", ruleType: "fracao_adicional", value: 6 }
      ]
    });

    priceTable = await prisma.priceTable.findUnique({ where: { id: created.id }, include: { rules: true } });
  }

  if (!priceTable) throw new Error("Nenhuma tabela de preÃ§os encontrada");

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

export async function GET() {
  try {
    if (process.env.DATABASE_URL) return jsonOk(await getPricingConfig());
    return jsonError("DATABASE_URL ausente no ambiente (Vercel).", 500, "MISSING_DATABASE_URL");

    const response = await fetch(buildUrl("/pricing"), {
      method: "GET",
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao buscar precificaÃ§Ã£o.";
    return jsonError(message, 502, "PRICING_UNAVAILABLE");
  }
}

export async function PUT(request: Request) {
  const bodyText = await request.text();

  try {
    if (process.env.DATABASE_URL) {
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
            name: "Tabela PadrÃ£o",
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
        const existing = await prisma.priceRule.findFirst({ where: { priceTableId: priceTable.id, ruleType: "primeira_hora" } });
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
              name: "FraÃ§Ã£o Adicional (Hora)",
              ruleType: "fracao_adicional",
              value: parsed.additionalFraction
            }
          });
        }
      }

      return jsonOk({ message: "ConfiguraÃ§Ãµes de preÃ§o atualizadas com sucesso" });
    }

    return jsonError("DATABASE_URL ausente no ambiente (Vercel).", 500, "MISSING_DATABASE_URL");

    const response = await fetch(buildUrl("/pricing"), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: bodyText
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao atualizar precificaÃ§Ã£o.";
    return jsonError(message, 502, "PRICING_UNAVAILABLE");
  }
}
