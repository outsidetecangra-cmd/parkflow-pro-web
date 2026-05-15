"use client";

import { useEffect, useMemo, useState } from "react";

import {
  findDemoTicket,
  formatCurrency,
  getDefaultDemoState,
  getDemoDashboardTotals,
  getDemoState,
  subscribeDemoStore,
  type DemoState,
} from "@/lib/demo-store";

type PeriodKey = "Hoje" | "Ontem" | "Semana" | "Mes" | "Periodo personalizado";
type ViewKey = "Unidade" | "Patio" | "Operador";

const periodScale: Record<PeriodKey, number> = {
  Hoje: 1,
  Ontem: 0.85,
  Semana: 5,
  Mes: 18,
  "Periodo personalizado": 2.5,
};

const viewDescriptions: Record<ViewKey, string> = {
  Unidade: "Indicadores consolidados da unidade ativa.",
  Patio: "Foco em ocupacao, vagas livres, permanencia e fluxo de veiculos.",
  Operador: "Foco em produtividade, tickets, caixa e acoes por operador.",
};

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

export function DashboardClient() {
  const [period, setPeriod] = useState<PeriodKey>("Hoje");
  const [view, setView] = useState<ViewKey>("Unidade");
  const [message, setMessage] = useState("Filtro ativo: Hoje / Unidade.");
  const [search, setSearch] = useState("");
  const [demoState, setDemoState] = useState<DemoState>(() => getDefaultDemoState());

  useEffect(() => {
    function refreshDashboard() {
      setDemoState(getDemoState());
    }

    refreshDashboard();
    return subscribeDemoStore(refreshDashboard);
  }, []);

  const baseTotals = useMemo(() => getDemoDashboardTotals(demoState), [demoState]);

  const data = useMemo(() => {
    const scale = periodScale[period];

    return {
      revenue: Math.round(baseTotals.revenue * scale),
      tickets: Math.max(baseTotals.tickets, Math.round(baseTotals.tickets * scale)),
      occupancy: baseTotals.occupancy,
      exits: Math.max(baseTotals.exits, Math.round(baseTotals.exits * scale)),
      cancelled: Math.round(baseTotals.cancelled * scale),
    };
  }, [baseTotals, period]);

  const alerts = useMemo(() => {
    const pendingTickets = demoState.tickets.filter((ticket) => ticket.status === "open").length;

    return [
      "Cancela norte online",
      "OCR/LPR sincronizado",
      `Caixa com saldo ${formatCurrency(baseTotals.balance)}`,
      `${pendingTickets} tickets aguardando pagamento`,
    ];
  }, [baseTotals.balance, demoState.tickets]);

  const chartData = useMemo(() => {
    const base = [35, 48, 62, 78, 71, 84];

    return base.map((value, index) => {
      const adjustedValue =
        view === "Patio"
          ? Math.max(8, Math.min(100, baseTotals.occupancy + index * 4))
          : view === "Operador"
            ? Math.max(20, value - 12)
            : value;

      return {
        label: ["08h", "10h", "12h", "14h", "16h", "18h"][index],
        value: adjustedValue,
      };
    });
  }, [baseTotals.occupancy, view]);

  function applyPeriod(nextPeriod: PeriodKey) {
    setPeriod(nextPeriod);
    setMessage(`Periodo alterado para ${nextPeriod}. Indicadores atualizados.`);
  }

  function applyView(nextView: ViewKey) {
    setView(nextView);
    setMessage(`Visao alterada para ${nextView}. ${viewDescriptions[nextView]}`);
  }

  function handleSearch() {
    if (!search.trim()) {
      setMessage("Digite uma placa, ticket, operador ou cliente para buscar.");
      return;
    }

    const ticket = findDemoTicket(search, demoState);
    setMessage(
      ticket
        ? `Ticket ${ticket.code} localizado para ${ticket.plate}.`
        : `Busca demonstrativa realizada por: ${search}.`
    );
  }

  function handleRefresh() {
    setDemoState(getDemoState());
    setMessage(`Dashboard atualizado: ${period} / ${view}.`);
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Visao unificada da operacao
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Dashboard operacional</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Painel demonstrativo com filtros funcionais para periodo, unidade,
              patio e operador.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar ticket, placa ou operador"
              className="w-64 rounded-2xl border bg-transparent px-4 py-3 text-sm"
            />
            <button
              onClick={handleSearch}
              className="rounded-2xl border px-5 py-3 text-sm hover:bg-white/10"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {(["Hoje", "Ontem", "Semana", "Mes", "Periodo personalizado"] as PeriodKey[]).map(
            (item) => (
              <button
                key={item}
                onClick={() => applyPeriod(item)}
                className={
                  period === item
                    ? "rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950"
                    : "rounded-full border px-5 py-3 text-sm hover:bg-white/10"
                }
              >
                {item}
              </button>
            )
          )}

          {(["Unidade", "Patio", "Operador"] as ViewKey[]).map((item) => (
            <button
              key={item}
              onClick={() => applyView(item)}
              className={
                view === item
                  ? "rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950"
                  : "rounded-full border px-5 py-3 text-sm hover:bg-white/10"
              }
            >
              {item}
            </button>
          ))}

          <button
            onClick={handleRefresh}
            className="rounded-full border px-5 py-3 text-sm hover:bg-white/10"
          >
            Atualizar
          </button>
        </div>

        {message ? (
          <p className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
            {message}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Receita"
          value={formatCurrency(data.revenue)}
          detail={`Periodo: ${period}`}
        />
        <MetricCard
          label="Tickets"
          value={String(data.tickets)}
          detail="Entradas registradas"
        />
        <MetricCard
          label="Ocupacao"
          value={`${data.occupancy}%`}
          detail={`${baseTotals.activeVehicles} veiculos no patio`}
        />
        <MetricCard
          label="Saidas"
          value={String(data.exits)}
          detail="Veiculos liberados"
        />
        <MetricCard
          label="Cancelamentos"
          value={String(data.cancelled)}
          detail="Ocorrencias tratadas"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Fluxo operacional</h2>
          <p className="mt-1 text-sm text-slate-500">
            Grafico demonstrativo atualizado pelos filtros selecionados.
          </p>

          <div className="mt-6 space-y-4">
            {chartData.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div
                    className="h-3 rounded-full bg-cyan-400"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Contexto operacional</h2>
          <p className="mt-1 text-sm text-slate-500">{viewDescriptions[view]}</p>

          <div className="mt-5 space-y-3">
            {alerts.map((alert) => (
              <p key={alert} className="rounded-2xl border p-3 text-sm">
                ✓ {alert}
              </p>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border p-5">
            <p className="text-sm text-slate-500">Filtro aplicado</p>
            <p className="mt-2 text-2xl font-semibold">
              {period} · {view}
            </p>
          </div>
        </section>
      </div>

      <section className="surface rounded-3xl p-6">
        <h2 className="text-xl font-semibold">Atalhos da apresentacao</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <a className="rounded-2xl border p-4 hover:bg-white/10" href="/operacao/entrada">
            Entrada
          </a>
          <a className="rounded-2xl border p-4 hover:bg-white/10" href="/operacao/saida">
            Saida
          </a>
          <a className="rounded-2xl border p-4 hover:bg-white/10" href="/operacao/patio">
            Patio
          </a>
          <a className="rounded-2xl border p-4 hover:bg-white/10" href="/caixa">
            Caixa
          </a>
        </div>
      </section>
    </div>
  );
}
