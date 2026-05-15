"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ReportItem = {
  id: string;
  title: string;
  period: string;
  status: "Pronto" | "Gerando" | "Agendado";
  total: string;
  description: string;
};

const initialReports: ReportItem[] = [
  {
    id: "REL-001",
    title: "Resumo financeiro diário",
    period: "Hoje",
    status: "Pronto",
    total: "R$ 2.840,00",
    description: "Entradas, saidas, pagamentos e saldo do caixa.",
  },
  {
    id: "REL-002",
    title: "Ocupacao do patio",
    period: "Semana atual",
    status: "Pronto",
    total: "78%",
    description: "Media de ocupacao, vagas livres e horarios de pico.",
  },
  {
    id: "SIN-DEMO001",
    title: "Relatorio de sinistro",
    period: "Entrada atual",
    status: "Pronto",
    total: "3 avarias",
    description: "Analise visual de avarias externas por cameras.",
  },
];

const revenueData = [
  { label: "Seg", value: 42 },
  { label: "Ter", value: 58 },
  { label: "Qua", value: 76 },
  { label: "Qui", value: 64 },
  { label: "Sex", value: 88 },
  { label: "Sab", value: 72 },
  { label: "Dom", value: 49 },
];

function makeReportId() {
  const number = Math.floor(100 + Math.random() * 900);
  return `REL-${number}`;
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState("Hoje");
  const [reportType, setReportType] = useState("Financeiro");
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [message, setMessage] = useState("");

  const totals = useMemo(() => {
    return {
      receita: "R$ 2.840,00",
      tickets: "126",
      ocupacao: "78%",
      sinistros: "3",
    };
  }, []);

  function handleGenerateReport() {
    const newReport: ReportItem = {
      id: makeReportId(),
      title: `Relatorio ${reportType.toLowerCase()}`,
      period,
      status: "Pronto",
      total:
        reportType === "Financeiro"
          ? "R$ 2.840,00"
          : reportType === "Operacional"
            ? "126 tickets"
            : reportType === "Sinistro"
              ? "3 avarias"
              : "78%",
      description: `Relatorio demonstrativo de ${reportType.toLowerCase()} para o periodo ${period}.`,
    };

    setReports((current) => [newReport, ...current]);
    setMessage(`${newReport.title} gerado com sucesso em modo demonstracao.`);
  }

  function handleExportPdf() {
    setMessage("PDF gerado em modo demonstracao.");
  }

  function handleExportExcel() {
    setMessage("Planilha Excel gerada em modo demonstracao.");
  }

  function handleSchedule() {
    setMessage("Relatorio agendado para envio automatico em modo demonstracao.");
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-4 lg:p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Relatorios gerenciais
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold lg:text-3xl">
              Central de relatorios
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Painel demonstrativo para relatorios financeiros, operacionais,
              ocupacao do patio, tickets, operadores, fechamento de caixa e sinistros.
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Gerar relatorio
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Receita</p>
            <p className="mt-2 text-2xl font-bold">{totals.receita}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Tickets</p>
            <p className="mt-2 text-2xl font-bold">{totals.tickets}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Ocupacao</p>
            <p className="mt-2 text-2xl font-bold">{totals.ocupacao}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Sinistros</p>
            <p className="mt-2 text-2xl font-bold">{totals.sinistros}</p>
          </div>
        </div>
      </section>

      <section className="surface rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-4 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Novo modulo
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Relatorio de Sinistro
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Cameras registram o veiculo na entrada por todos os lados e geram
              analise de avarias externas, como arranhoes, amassados, pneus furados,
              trincas, farois quebrados e danos aparentes.
            </p>
          </div>

          <Link
            href="/relatorios/sinistro"
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Acessar Sinistro
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <p className="rounded-2xl border border-cyan-400/20 p-4 text-sm">
            ✓ Camera frontal
          </p>
          <p className="rounded-2xl border border-cyan-400/20 p-4 text-sm">
            ✓ Camera traseira
          </p>
          <p className="rounded-2xl border border-cyan-400/20 p-4 text-sm">
            ✓ Laterais esquerda/direita
          </p>
          <p className="rounded-2xl border border-cyan-400/20 p-4 text-sm">
            ✓ PDF de sinistro
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="surface rounded-3xl p-4 lg:p-6">
          <h2 className="text-xl font-semibold">Filtros do relatorio</h2>
          <p className="mt-1 text-sm text-slate-500">
            Selecione o tipo e o periodo para simular a emissao do relatorio.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
            >
              <option>Financeiro</option>
              <option>Operacional</option>
              <option>Ocupacao</option>
              <option>Operadores</option>
              <option>Mensalistas</option>
              <option>Caixa</option>
              <option>Sinistro</option>
            </select>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
            >
              <option>Hoje</option>
              <option>Ultimos 7 dias</option>
              <option>Mes atual</option>
              <option>Trimestre</option>
              <option>Personalizado</option>
            </select>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleGenerateReport}
              className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Gerar
            </button>
            <button
              onClick={handleExportPdf}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Exportar PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Exportar Excel
            </button>
            <button
              onClick={handleSchedule}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Agendar envio
            </button>
          </div>

          {message ? (
            <p className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
              {message}
            </p>
          ) : null}
        </section>

        <section className="surface rounded-3xl p-4 lg:p-6">
          <h2 className="text-xl font-semibold">Receita da semana</h2>
          <p className="mt-1 text-sm text-slate-500">
            Grafico demonstrativo de desempenho financeiro.
          </p>

          <div className="mt-6 space-y-4">
            {revenueData.map((item) => (
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
      </div>

      <section className="surface rounded-3xl p-4 lg:p-6">
        <h2 className="text-xl font-semibold">Relatorios recentes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Historico demonstrativo dos ultimos relatorios gerados.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {reports.map((report) => (
            <article key={report.id} className="rounded-3xl border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    {report.id}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{report.title}</h3>
                </div>

                <span className="rounded-full border px-3 py-1 text-xs">
                  {report.status}
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">{report.description}</p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">{report.period}</span>
                <strong>{report.total}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
