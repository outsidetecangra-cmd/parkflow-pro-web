"use client";

import { useMemo, useState } from "react";

type DamageSeverity = "Baixo" | "Medio" | "Critico";

type DamageItem = {
  id: string;
  area: string;
  type: string;
  severity: DamageSeverity;
  confidence: number;
  camera: string;
};

type SinistroReport = {
  id: string;
  plate: string;
  vehicle: string;
  entryAt: string;
  status: "Sem avaria" | "Atenção" | "Crítico";
  damages: DamageItem[];
};

const cameras = [
  {
    id: "CAM-001",
    name: "Camera frontal",
    position: "Frente do veiculo",
    status: "Online",
  },
  {
    id: "CAM-002",
    name: "Camera traseira",
    position: "Traseira do veiculo",
    status: "Online",
  },
  {
    id: "CAM-003",
    name: "Camera lateral esquerda",
    position: "Lado esquerdo",
    status: "Online",
  },
  {
    id: "CAM-004",
    name: "Camera lateral direita",
    position: "Lado direito",
    status: "Online",
  },
];

const initialDamages: DamageItem[] = [
  {
    id: "AVR-001",
    area: "Para-choque dianteiro",
    type: "Arranhao superficial",
    severity: "Baixo",
    confidence: 94,
    camera: "Camera frontal",
  },
  {
    id: "AVR-002",
    area: "Porta lateral direita",
    type: "Amassado pequeno",
    severity: "Medio",
    confidence: 89,
    camera: "Camera lateral direita",
  },
  {
    id: "AVR-003",
    area: "Pneu traseiro esquerdo",
    type: "Pressao baixa / possivel pneu murcho",
    severity: "Critico",
    confidence: 86,
    camera: "Camera lateral esquerda",
  },
];

function makeReportId() {
  const number = Math.floor(100000 + Math.random() * 900000);
  return `SIN-${number}`;
}

function getReportStatus(damages: DamageItem[]): SinistroReport["status"] {
  if (damages.some((item) => item.severity === "Critico")) {
    return "Crítico";
  }

  if (damages.length > 0) {
    return "Atenção";
  }

  return "Sem avaria";
}

export default function RelatorioSinistroPage() {
  const [plate, setPlate] = useState("DEMO777");
  const [vehicle, setVehicle] = useState("Jeep Compass");
  const [damages, setDamages] = useState<DamageItem[]>(initialDamages);
  const [message, setMessage] = useState("");
  const [report, setReport] = useState<SinistroReport>({
    id: "SIN-DEMO001",
    plate: "DEMO777",
    vehicle: "Jeep Compass",
    entryAt: "Agora",
    status: getReportStatus(initialDamages),
    damages: initialDamages,
  });

  const totals = useMemo(() => {
    return {
      total: damages.length,
      low: damages.filter((item) => item.severity === "Baixo").length,
      medium: damages.filter((item) => item.severity === "Medio").length,
      critical: damages.filter((item) => item.severity === "Critico").length,
      averageConfidence:
        damages.length > 0
          ? Math.round(
              damages.reduce((sum, item) => sum + item.confidence, 0) / damages.length
            )
          : 100,
    };
  }, [damages]);

  function handleAnalyzeVehicle() {
    const nextDamages = [
      ...initialDamages,
      {
        id: "AVR-" + Math.floor(100 + Math.random() * 900),
        area: "Retrovisor direito",
        type: "Risco detectado",
        severity: "Baixo" as const,
        confidence: 91,
        camera: "Camera lateral direita",
      },
    ];

    setDamages(nextDamages);
    setReport({
      id: "SIN-DEMO001",
      plate: plate.toUpperCase(),
      vehicle,
      entryAt: "Agora",
      status: getReportStatus(nextDamages),
      damages: nextDamages,
    });

    setMessage("Analise das cameras concluida. Avarias externas identificadas.");
  }

  function handleCleanVehicle() {
    setDamages([]);
    setReport({
      id: "SIN-DEMO001",
      plate: plate.toUpperCase(),
      vehicle,
      entryAt: "Agora",
      status: "Sem avaria",
      damages: [],
    });

    setMessage("Veiculo analisado sem avarias externas aparentes.");
  }

  function handleGenerateReport() {
    setReport({
      id: "SIN-DEMO001",
      plate: plate.toUpperCase(),
      vehicle,
      entryAt: "Agora",
      status: getReportStatus(damages),
      damages,
    });

    setMessage("Relatorio de sinistro gerado com sucesso em modo demonstracao.");
  }

  function handleExportReport() {
    setMessage(`PDF do relatorio ${report.id} exportado em modo demonstracao.`);
  }

  function handleSendToClient() {
    setMessage(`Relatorio ${report.id} enviado ao cliente/operador em modo demonstracao.`);
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-4 lg:p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Relatorio de sinistro
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold lg:text-3xl">
              Analise visual de avarias
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Simulacao de cameras registrando o veiculo em todos os lados na entrada,
              identificando arranhoes, amassados, pneus, trincas e defeitos externos.
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Gerar sinistro
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-2 text-xl font-bold">{report.status}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Avarias</p>
            <p className="mt-2 text-2xl font-bold">{totals.total}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Criticas</p>
            <p className="mt-2 text-2xl font-bold">{totals.critical}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Confianca media</p>
            <p className="mt-2 text-2xl font-bold">{totals.averageConfidence}%</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Relatorio</p>
            <p className="mt-2 text-xl font-bold">{report.id}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="surface rounded-3xl p-4 lg:p-6">
          <h2 className="text-xl font-semibold">Dados do veiculo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Informe placa e veiculo para simular a leitura das cameras.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Placa"
            />

            <input
              value={vehicle}
              onChange={(event) => setVehicle(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Veiculo"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleAnalyzeVehicle}
              className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Analisar cameras
            </button>

            <button
              onClick={handleCleanVehicle}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Simular sem avaria
            </button>

            <button
              onClick={handleExportReport}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Exportar PDF
            </button>

            <button
              onClick={handleSendToClient}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Enviar relatorio
            </button>
          </div>

          {message ? (
            <p className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
              {message}
            </p>
          ) : null}
        </section>

        <section className="surface rounded-3xl p-4 lg:p-6">
          <h2 className="text-xl font-semibold">Cameras de inspeção</h2>
          <p className="mt-1 text-sm text-slate-500">
            Captura simultanea dos quatro lados do veiculo.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {cameras.map((camera) => (
              <div key={camera.id} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{camera.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{camera.position}</p>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs">
                    {camera.status}
                  </span>
                </div>

                <div className="mt-4 flex h-28 items-center justify-center rounded-2xl border bg-gradient-to-br from-slate-900 to-cyan-900/50">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Preview camera
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="surface rounded-3xl p-4 lg:p-6">
        <h2 className="text-xl font-semibold">Avarias identificadas</h2>
        <p className="mt-1 text-sm text-slate-500">
          Lista demonstrativa de danos externos detectados automaticamente.
        </p>

        <div className="mt-5 space-y-3">
          {damages.length === 0 ? (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              Nenhuma avaria externa identificada.
            </div>
          ) : (
            damages.map((damage) => (
              <div key={damage.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{damage.type}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {damage.area} · {damage.camera} · {damage.confidence}% de confianca
                    </p>
                  </div>

                  <span className="rounded-full border px-3 py-1 text-xs">
                    {damage.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="surface rounded-3xl p-4 lg:p-6">
        <h2 className="text-xl font-semibold">Resumo do sinistro</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <p className="rounded-2xl border p-4">
            ✓ Registro visual no momento da entrada
          </p>
          <p className="rounded-2xl border p-4">
            ✓ Identificacao automatica de danos externos
          </p>
          <p className="rounded-2xl border p-4">
            ✓ Relatorio pronto para anexar ao ticket
          </p>
        </div>
      </section>
    </div>
  );
}


