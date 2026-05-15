"use client";

import { useEffect, useState } from "react";

import {
  createDemoTicket,
  formatTimeLabel,
  getDefaultDemoState,
  getDemoTicketStatusLabel,
  listDemoTickets,
  subscribeDemoStore,
  type DemoTicket,
} from "@/lib/demo-store";

export function EntryOperationsClient() {
  const [plate, setPlate] = useState("DEMO777");
  const [model, setModel] = useState("Honda HR-V");
  const [color, setColor] = useState("Branco");
  const [customer, setCustomer] = useState("Cliente avulso");
  const [driver, setDriver] = useState("Cliente avulso");
  const [spot, setSpot] = useState("A-01");
  const [yard, setYard] = useState("Patio principal");
  const [priceTable, setPriceTable] = useState("Tabela padrao");
  const [notes, setNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [ocrMessage, setOcrMessage] = useState("");
  const [gateMessage, setGateMessage] = useState("");
  const [tickets, setTickets] = useState<DemoTicket[]>(() =>
    getDefaultDemoState().tickets.slice(0, 5)
  );

  useEffect(() => {
    function refreshTickets() {
      setTickets(listDemoTickets().slice(0, 5));
    }

    refreshTickets();
    return subscribeDemoStore(refreshTickets);
  }, []);

  const latestTicket = tickets[0];

  function handleRegisterEntry() {
    const result = createDemoTicket({
      plate,
      model,
      color,
      customer,
      driver,
      spot,
      yard,
      priceTable,
      notes,
    });
    const newTicket = result.ticket;

    setTickets(listDemoTickets().slice(0, 5));
    setSuccessMessage(`Entrada registrada com sucesso. Ticket ${newTicket.code} criado.`);
    setOcrMessage(`OCR/LPR validado para a placa ${newTicket.plate}.`);
    setGateMessage(`Cancela de entrada liberada. Vaga ${newTicket.spot} ocupada.`);
  }

  function handleSimulateOcr() {
    setPlate("DEMO002");
    setModel("Toyota Corolla");
    setColor("Prata");
    setOcrMessage("Leitura OCR/LPR simulada: DEMO002 detectada com 98,7% de confianca.");
  }

  function handleOpenGate() {
    setGateMessage("Cancela aberta com sucesso em modo demonstracao.");
  }

  function handleQrCode() {
    if (!latestTicket) {
      setSuccessMessage("Registre uma entrada para gerar o QR Code.");
      return;
    }

    setSuccessMessage(`QR Code gerado para o ticket ${latestTicket.code}.`);
  }

  function handleClear() {
    setPlate("");
    setModel("");
    setColor("");
    setCustomer("Cliente avulso");
    setDriver("Cliente avulso");
    setSpot("");
    setNotes("");
    setSuccessMessage("");
    setOcrMessage("");
    setGateMessage("");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Operação de entrada
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Registrar entrada</h1>
        <p className="mt-2 text-sm text-slate-500">
          Fluxo demonstrativo com criação de ticket, OCR/LPR, QR Code e abertura de cancela.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border bg-transparent px-4 py-3" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="Placa" />
          <input className="rounded-2xl border bg-transparent px-4 py-3" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modelo" />
          <input className="rounded-2xl border bg-transparent px-4 py-3" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Cor" />
          <input className="rounded-2xl border bg-transparent px-4 py-3" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Cliente" />
          <input className="rounded-2xl border bg-transparent px-4 py-3" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Condutor" />
          <input className="rounded-2xl border bg-transparent px-4 py-3" value={spot} onChange={(e) => setSpot(e.target.value)} placeholder="Vaga" />
          <input className="rounded-2xl border bg-transparent px-4 py-3" value={yard} onChange={(e) => setYard(e.target.value)} placeholder="Pátio" />
          <input className="rounded-2xl border bg-transparent px-4 py-3" value={priceTable} onChange={(e) => setPriceTable(e.target.value)} placeholder="Tabela de preço" />
        </div>

        <textarea
          className="mt-3 min-h-24 w-full rounded-2xl border bg-transparent px-4 py-3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações e serviços adicionais"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={handleRegisterEntry} className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
            Registrar entrada
          </button>
          <button onClick={handleQrCode} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
            Gerar QR Code
          </button>
          <button onClick={handleSimulateOcr} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
            Simular OCR/LPR
          </button>
          <button onClick={handleOpenGate} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
            Abrir cancela
          </button>
          <button onClick={handleClear} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
            Limpar
          </button>
        </div>

        {successMessage ? <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{successMessage}</p> : null}
        {ocrMessage ? <p className="mt-3 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-300">{ocrMessage}</p> : null}
        {gateMessage ? <p className="mt-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">{gateMessage}</p> : null}
      </section>

      <aside className="space-y-6">
        <section className="surface rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Último ticket</p>
          {latestTicket ? (
            <>
              <h2 className="mt-3 text-2xl font-semibold">{latestTicket.code}</h2>
              <div className="mt-4 grid gap-3 text-sm">
                <p><span className="text-slate-500">Placa:</span> {latestTicket.plate}</p>
                <p><span className="text-slate-500">Veículo:</span> {latestTicket.model} - {latestTicket.color}</p>
                <p><span className="text-slate-500">Cliente:</span> {latestTicket.customer}</p>
                <p><span className="text-slate-500">Entrada:</span> {formatTimeLabel(latestTicket.entryAtISO)}</p>
                <p><span className="text-slate-500">Vaga:</span> {latestTicket.spot}</p>
                <p><span className="text-slate-500">Status:</span> {getDemoTicketStatusLabel(latestTicket.status)}</p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Nenhum ticket registrado.</p>
          )}
        </section>

        <section className="surface rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Tickets recentes</p>
          <div className="mt-4 space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.code} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{ticket.plate}</strong>
                  <span className="text-xs text-slate-500">{formatTimeLabel(ticket.entryAtISO)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {ticket.code} · {getDemoTicketStatusLabel(ticket.status)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
