"use client";

import { useMemo, useState } from "react";

type EquipmentStatus = "Online" | "Offline" | "Manutencao";

type Equipment = {
  id: string;
  name: string;
  type: string;
  location: string;
  ip: string;
  status: EquipmentStatus;
  lastSync: string;
};

const initialEquipments: Equipment[] = [
  {
    id: "EQP-001",
    name: "Cancela Entrada Norte",
    type: "Cancela",
    location: "Entrada principal",
    ip: "192.168.0.21",
    status: "Online",
    lastSync: "Agora",
  },
  {
    id: "EQP-002",
    name: "Camera OCR Entrada",
    type: "Camera LPR",
    location: "Entrada principal",
    ip: "192.168.0.32",
    status: "Online",
    lastSync: "2 min atrás",
  },
  {
    id: "EQP-003",
    name: "Cancela Saida Sul",
    type: "Cancela",
    location: "Saida principal",
    ip: "192.168.0.22",
    status: "Online",
    lastSync: "Agora",
  },
  {
    id: "EQP-004",
    name: "Totem Autoatendimento",
    type: "Totem",
    location: "Hall de pagamento",
    ip: "192.168.0.45",
    status: "Manutencao",
    lastSync: "18 min atrás",
  },
];

function makeEquipmentId() {
  const number = Math.floor(100 + Math.random() * 900);
  return `EQP-${number}`;
}

export default function AutomacaoEquipamentosPage() {
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [selected, setSelected] = useState<Equipment>(initialEquipments[0]);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("Novo equipamento demo");
  const [type, setType] = useState("Cancela");
  const [location, setLocation] = useState("Patio principal");
  const [ip, setIp] = useState("192.168.0.99");

  const totals = useMemo(() => {
    return {
      total: equipments.length,
      online: equipments.filter((item) => item.status === "Online").length,
      offline: equipments.filter((item) => item.status === "Offline").length,
      maintenance: equipments.filter((item) => item.status === "Manutencao").length,
    };
  }, [equipments]);

  function updateSelected(updated: Equipment) {
    setSelected(updated);
    setEquipments((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
  }

  function handleTestConnection() {
    setMessage(`Conexão testada com sucesso em ${selected.name}.`);
  }

  function handleSync() {
    const updated = {
      ...selected,
      status: "Online" as EquipmentStatus,
      lastSync: "Agora",
    };

    updateSelected(updated);
    setMessage(`${selected.name} sincronizado com sucesso.`);
  }

  function handleRestart() {
    setMessage(`${selected.name} reiniciado em modo demonstração.`);
  }

  function handleOpenGate() {
    setMessage(`Comando enviado para ${selected.name}: abertura/liberação simulada.`);
  }

  function handleToggleStatus() {
    const nextStatus: EquipmentStatus =
      selected.status === "Online"
        ? "Offline"
        : selected.status === "Offline"
          ? "Manutencao"
          : "Online";

    const updated = {
      ...selected,
      status: nextStatus,
      lastSync: "Agora",
    };

    updateSelected(updated);
    setMessage(`Status de ${selected.name} alterado para ${nextStatus}.`);
  }

  function handleAddEquipment() {
    if (!name || !type || !location || !ip) {
      setMessage("Preencha nome, tipo, local e IP para cadastrar o equipamento.");
      return;
    }

    const equipment: Equipment = {
      id: makeEquipmentId(),
      name,
      type,
      location,
      ip,
      status: "Online",
      lastSync: "Agora",
    };

    setEquipments((current) => [equipment, ...current]);
    setSelected(equipment);
    setMessage(`${equipment.name} cadastrado e conectado em modo demonstração.`);
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Automação
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Equipamentos conectados</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Painel demonstrativo para monitorar cancelas, cameras OCR/LPR,
              totens, terminais e dispositivos integrados.
            </p>
          </div>

          <button
            onClick={handleSync}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Sincronizar tudo
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-bold">{totals.total}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Online</p>
            <p className="mt-2 text-2xl font-bold">{totals.online}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Offline</p>
            <p className="mt-2 text-2xl font-bold">{totals.offline}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Manutenção</p>
            <p className="mt-2 text-2xl font-bold">{totals.maintenance}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Lista de equipamentos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Clique em um equipamento para executar comandos operacionais.
          </p>

          <div className="mt-5 space-y-3">
            {equipments.map((equipment) => (
              <button
                key={equipment.id}
                onClick={() => {
                  setSelected(equipment);
                  setMessage(`${equipment.name} selecionado.`);
                }}
                className="w-full rounded-2xl border p-4 text-left hover:bg-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{equipment.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {equipment.id} · {equipment.type} · {equipment.location}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full border px-3 py-1 text-xs">
                      {equipment.status}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">{equipment.ip}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="surface rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Equipamento selecionado
            </p>

            <h2 className="mt-3 text-2xl font-semibold">{selected.name}</h2>

            <div className="mt-5 space-y-3 text-sm">
              <p><span className="text-slate-500">Código:</span> {selected.id}</p>
              <p><span className="text-slate-500">Tipo:</span> {selected.type}</p>
              <p><span className="text-slate-500">Local:</span> {selected.location}</p>
              <p><span className="text-slate-500">IP:</span> {selected.ip}</p>
              <p><span className="text-slate-500">Status:</span> {selected.status}</p>
              <p><span className="text-slate-500">Última sincronização:</span> {selected.lastSync}</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button
                onClick={handleTestConnection}
                className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Testar conexão
              </button>

              <button
                onClick={handleOpenGate}
                className="rounded-2xl border px-5 py-3 hover:bg-white/10"
              >
                Enviar comando
              </button>

              <button
                onClick={handleRestart}
                className="rounded-2xl border px-5 py-3 hover:bg-white/10"
              >
                Reiniciar
              </button>

              <button
                onClick={handleToggleStatus}
                className="rounded-2xl border px-5 py-3 hover:bg-white/10"
              >
                Alternar status
              </button>
            </div>

            {message ? (
              <p className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
                {message}
              </p>
            ) : null}
          </section>

          <section className="surface rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Novo equipamento</h2>

            <div className="mt-5 grid gap-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
                placeholder="Nome"
              />

              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              >
                <option>Cancela</option>
                <option>Camera LPR</option>
                <option>Totem</option>
                <option>Terminal</option>
                <option>Sensor</option>
              </select>

              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
                placeholder="Local"
              />

              <input
                value={ip}
                onChange={(event) => setIp(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
                placeholder="IP"
              />

              <button
                onClick={handleAddEquipment}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Cadastrar equipamento
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
