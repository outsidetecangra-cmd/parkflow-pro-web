"use client";

import { useEffect, useState } from "react";
import { AuditTimeline } from "@/components/audit-timeline";
import { CashSummary } from "@/components/cash-summary";
import { DataTable } from "@/components/data-table";
import { FilterBar } from "@/components/filter-bar";
import { GateStatusCard } from "@/components/gate-status-card";
import { StatCard } from "@/components/stat-card";
import { ValetQueueBoard } from "@/components/valet-queue-board";
import { fetchUserContext, getSession, type UserContext } from "@/lib/api";
import { dashboardStats, devices, units } from "@/lib/mock-data";

export function DashboardClient() {
  const [context, setContext] = useState<UserContext | null>(null);

  useEffect(() => {
    async function loadContext() {
      const session = getSession();
      if (!session?.accessToken) return;

      try {
        const response = await fetchUserContext(session.accessToken);
        setContext(response);
      } catch {
        setContext(null);
      }
    }

    void loadContext();
  }, []);

  const scopedStats = context?.activeUnit
    ? [
        {
          label: "Unidade ativa",
          value: context.activeUnit.name,
          delta: context.user.role ?? "Operacao",
          tone: "info" as const
        },
        ...dashboardStats.slice(0, 5)
      ]
    : dashboardStats;

  return (
    <div className="space-y-6">
      <FilterBar />
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-white/80 p-5 dark:bg-slate-950/80">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Contexto operacional</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>Usuario: {context?.user.name ?? "Nao autenticado"}</span>
          <span>Unidade: {context?.activeUnit?.name ?? "Nao selecionada"}</span>
          <span>Patio padrao: {context?.operationDefaults.parkingLotName ?? "Nao configurado"}</span>
          <span>Tabela padrao: {context?.operationDefaults.priceTableName ?? "Nao configurada"}</span>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {scopedStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <DataTable
          title="Unidades mais rentaveis"
          columns={["Unidade", "Ocupacao", "Faturamento", "Cancelas online"]}
          rows={units.map((unit) => [unit.name, `${unit.occupancy}%`, `R$ ${unit.revenue}`, String(unit.gatesOnline)])}
        />
        <CashSummary />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {devices.map((device) => (
          <GateStatusCard key={device.id} device={device} />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <AuditTimeline />
        <ValetQueueBoard />
      </section>
    </div>
  );
}

