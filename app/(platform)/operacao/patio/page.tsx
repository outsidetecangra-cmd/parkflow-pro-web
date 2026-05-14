"use client";

import { useMemo, useState } from "react";

type PatioVehicle = {
  spot: string;
  plate: string;
  model: string;
  customer: string;
  entryAt: string;
  duration: string;
  status: "Ocupada" | "Reservada" | "Livre";
};

const initialVehicles: PatioVehicle[] = [
  {
    spot: "A-01",
    plate: "DEMO001",
    model: "Jeep Compass",
    customer: "Cliente avulso",
    entryAt: "08:20",
    duration: "3h 35m",
    status: "Ocupada",
  },
  {
    spot: "A-02",
    plate: "DEMO002",
    model: "Toyota Corolla",
    customer: "Mensalista",
    entryAt: "09:10",
    duration: "2h 45m",
    status: "Ocupada",
  },
  {
    spot: "B-04",
    plate: "DEMO003",
    model: "Honda HR-V",
    customer: "Cliente avulso",
    entryAt: "10:05",
    duration: "1h 50m",
    status: "Ocupada",
  },
  {
    spot: "C-08",
    plate: "—",
    model: "Disponível",
    customer: "—",
    entryAt: "—",
    duration: "—",
    status: "Livre",
  },
  {
    spot: "D-02",
    plate: "RESERVA",
    model: "Vaga mensalista",
    customer: "Contrato ativo",
    entryAt: "—",
    duration: "—",
    status: "Reservada",
  },
];

export default function PatioPage() {
  const [vehicles, setVehicles] = useState<PatioVehicle[]>(initialVehicles);
  const [selectedSpot, setSelectedSpot] = useState<PatioVehicle>(initialVehicles[0]);
  const [message, setMessage] = useState("");

  const totals = useMemo(() => {
    const occupied = vehicles.filter((item) => item.status === "Ocupada").length;
    const reserved = vehicles.filter((item) => item.status === "Reservada").length;
    const free = vehicles.filter((item) => item.status === "Livre").length;

    return { occupied, reserved, free, total: vehicles.length };
  }, [vehicles]);

  function handleRefresh() {
    setMessage("Mapa do pátio atualizado em modo demonstração.");
  }

  function handleReleaseSpot() {
    setVehicles((current) =>
      current.map((item) =>
        item.spot === selectedSpot.spot
          ? {
              ...item,
              plate: "—",
              model: "Disponível",
              customer: "—",
              entryAt: "—",
              duration: "—",
              status: "Livre",
            }
          : item
      )
    );

    setSelectedSpot((current) => ({
      ...current,
      plate: "—",
      model: "Disponível",
      customer: "—",
      entryAt: "—",
      duration: "—",
      status: "Livre",
    }));

    setMessage(`Vaga ${selectedSpot.spot} liberada em modo demonstração.`);
  }

  function handleSimulateEntry() {
    const freeSpot = vehicles.find((item) => item.status === "Livre");

    if (!freeSpot) {
      setMessage("Não há vagas livres para simular nova entrada.");
      return;
    }

    const updatedSpot: PatioVehicle = {
      spot: freeSpot.spot,
      plate: "DEMO004",
      model: "Fiat Pulse",
      customer: "Cliente avulso",
      entryAt: "Agora",
      duration: "0h 00m",
      status: "Ocupada",
    };

    setVehicles((current) =>
      current.map((item) => (item.spot === freeSpot.spot ? updatedSpot : item))
    );

    setSelectedSpot(updatedSpot);
    setMessage(`Nova entrada simulada na vaga ${freeSpot.spot}.`);
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Operação de pátio
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Mapa operacional do pátio</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Visualização demonstrativa das vagas, veículos estacionados, mensalistas,
          ocupação e ações rápidas para apresentação comercial.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Total de vagas</p>
            <p className="mt-2 text-3xl font-bold">{totals.total}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Ocupadas</p>
            <p className="mt-2 text-3xl font-bold">{totals.occupied}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Livres</p>
            <p className="mt-2 text-3xl font-bold">{totals.free}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Reservadas</p>
            <p className="mt-2 text-3xl font-bold">{totals.reserved}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Vagas em tempo real</h2>
              <p className="mt-1 text-sm text-slate-500">
                Clique em uma vaga para ver os detalhes operacionais.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Atualizar pátio
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.spot}
                onClick={() => {
                  setSelectedSpot(vehicle);
                  setMessage(`Vaga ${vehicle.spot} selecionada.`);
                }}
                className="rounded-3xl border p-5 text-left transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Vaga</p>
                    <h3 className="mt-1 text-2xl font-bold">{vehicle.spot}</h3>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs">
                    {vehicle.status}
                  </span>
                </div>

                <p className="mt-5 text-lg font-semibold">{vehicle.plate}</p>
                <p className="mt-1 text-sm text-slate-500">{vehicle.model}</p>
                <p className="mt-3 text-xs text-slate-500">
                  Entrada: {vehicle.entryAt} · Permanência: {vehicle.duration}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="surface rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Vaga selecionada
            </p>
            <h2 className="mt-3 text-3xl font-semibold">{selectedSpot.spot}</h2>

            <div className="mt-5 space-y-3 text-sm">
              <p><span className="text-slate-500">Status:</span> {selectedSpot.status}</p>
              <p><span className="text-slate-500">Placa:</span> {selectedSpot.plate}</p>
              <p><span className="text-slate-500">Veículo:</span> {selectedSpot.model}</p>
              <p><span className="text-slate-500">Cliente:</span> {selectedSpot.customer}</p>
              <p><span className="text-slate-500">Entrada:</span> {selectedSpot.entryAt}</p>
              <p><span className="text-slate-500">Permanência:</span> {selectedSpot.duration}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSimulateEntry}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Simular entrada
              </button>
              <button
                onClick={handleReleaseSpot}
                className="rounded-2xl border px-5 py-3 hover:bg-white/10"
              >
                Liberar vaga
              </button>
            </div>
          </section>

          <section className="surface rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Eventos recentes
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <p className="rounded-2xl border p-3">✓ Entrada DEMO001 validada por OCR/LPR</p>
              <p className="rounded-2xl border p-3">✓ Vaga A-02 vinculada a mensalista</p>
              <p className="rounded-2xl border p-3">✓ Cancela norte online</p>
              <p className="rounded-2xl border p-3">✓ Operador sincronizado</p>
            </div>
          </section>

          {message ? (
            <p className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
              {message}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
