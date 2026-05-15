import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  private async createDefaultPriceTable() {
    const priceTable = await this.prisma.priceTable.create({
      data: {
        name: "Tabela Padrão",
        type: "PADRAO",
        active: true,
        graceMinutes: 15,
        maxDaily: null
      }
    });

    await this.prisma.priceRule.createMany({
      data: [
        {
          priceTableId: priceTable.id,
          name: "Primeira Hora",
          ruleType: "primeira_hora",
          value: 12
        },
        {
          priceTableId: priceTable.id,
          name: "Fração Adicional (Hora)",
          ruleType: "fracao_adicional",
          value: 6
        }
      ]
    });

    return this.prisma.priceTable.findUnique({
      where: { id: priceTable.id },
      include: { rules: true }
    });
  }

  async getPricingConfig() {
    let priceTable = await this.prisma.priceTable.findFirst({
      where: { active: true },
      include: { rules: true }
    });

    if (!priceTable) {
      priceTable = await this.prisma.priceTable.findFirst({
        include: { rules: true }
      });
    }

    if (!priceTable) {
      priceTable = await this.createDefaultPriceTable();
    }

    if (!priceTable) {
      throw new NotFoundException({
        success: false,
        error: {
          code: "PRICE_TABLE_NOT_FOUND",
          message: "Nenhuma tabela de preços encontrada"
        }
      });
    }

    const firstHourRule = priceTable.rules.find((rule) => rule.ruleType === "primeira_hora");
    const additionalFractionRule = priceTable.rules.find((rule) => rule.ruleType === "fracao_adicional");

    return {
      success: true,
      data: {
        priceTableId: priceTable.id,
        name: priceTable.name,
        graceMinutes: priceTable.graceMinutes,
        maxDaily: priceTable.maxDaily ? Number(priceTable.maxDaily) : null,
        firstHour: firstHourRule ? Number(firstHourRule.value) : 12,
        additionalFraction: additionalFractionRule ? Number(additionalFractionRule.value) : 6
      }
    };
  }

  async updatePricingConfig(body: {
    firstHour: number;
    additionalFraction: number;
    graceMinutes: number;
    maxDaily: number | null;
  }) {
    let priceTable = await this.prisma.priceTable.findFirst({
      where: { active: true }
    });

    if (!priceTable) {
      priceTable = await this.prisma.priceTable.create({
        data: {
          name: "Tabela Padrão",
          type: "PADRAO",
          active: true,
          graceMinutes: body.graceMinutes,
          maxDaily: body.maxDaily
        }
      });
    }

    await this.prisma.priceTable.update({
      where: { id: priceTable.id },
      data: {
        graceMinutes: body.graceMinutes,
        maxDaily: body.maxDaily
      }
    });

    const firstHourRule = await this.prisma.priceRule.findFirst({
      where: { priceTableId: priceTable.id, ruleType: "primeira_hora" }
    });

    if (firstHourRule) {
      await this.prisma.priceRule.update({
        where: { id: firstHourRule.id },
        data: { value: body.firstHour }
      });
    } else {
      await this.prisma.priceRule.create({
        data: {
          priceTableId: priceTable.id,
          name: "Primeira Hora",
          ruleType: "primeira_hora",
          value: body.firstHour
        }
      });
    }

    const additionalFractionRule = await this.prisma.priceRule.findFirst({
      where: { priceTableId: priceTable.id, ruleType: "fracao_adicional" }
    });

    if (additionalFractionRule) {
      await this.prisma.priceRule.update({
        where: { id: additionalFractionRule.id },
        data: { value: body.additionalFraction }
      });
    } else {
      await this.prisma.priceRule.create({
        data: {
          priceTableId: priceTable.id,
          name: "Fração Adicional (Hora)",
          ruleType: "fracao_adicional",
          value: body.additionalFraction
        }
      });
    }

    return {
      success: true,
      data: {
        message: "Configurações de preço atualizadas com sucesso"
      }
    };
  }
}

