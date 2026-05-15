"use client";

import { useEffect, useMemo, useState } from "react";

import {
  calculateDemoAmount,
  confirmDemoPayment,
  findDemoTicket,
  formatCurrency,
  formatDurationLabel,
  formatTimeLabel,
  getDefaultDemoState,
  getDemoTicketStatusLabel,
  releaseDemoExit,
  subscribeDemoStore,
  type DemoTicket,
} from "@/lib/demo-store";

function getInitialTicket() {
  return getDefaultDemoState().tickets.find((ticket) => ticket.plate === "DEMO001") ?? null;
}

function getTicketAmount(ticket: DemoTicket | null) {
  if (!ticket) return 0;
  return ticket.amount > 0 ? ticket.amount : calculateDemoAmount(ticket.entryAtISO);
}

function getTicketDuration(ticket: DemoTicket | null) {
  if (!ticket) return "-";
  return ticket.durationLabel || formatDurationLabel(ticket.entryAtISO, new Date().toISOString());
}

function getExitStatusLabel(ticket: DemoTicket | null) {
  if (!ticket) return "Aguardando busca";
  if (ticket.status === "open") return "Aguardando pagamento";
  return getDemoTicketStatusLabel(ticket.status);
}

export function ExitOperationsClient() {
  const [search, setSearch] = useState("DEMO777");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [successMessage, setSuccessMessage] = useState("");
  const [gateMessage, setGateMessage] = useState("");
  const [receiptMessage, setReceiptMessage] = useState("");
  const [ticket, setTicket] = useState<DemoTicket | null>(() => getInitialTicket());

  useEffect(() => {
    function refreshTicket() {
      setTicket((current) => {
        if (!current) return current;
        return findDemoTicket(current.code) ?? current;
      });
    }

    return subscribeDemoStore(refreshTicket);
  }, []);

  const paidLabel = useMemo(() => {
    if (!ticket) return "Ticket nao localizado";
    return ticket.status === "paid" || ticket.status === "exited"
      ? "Pagamento confirmado"
      : "Pagamento pendente";
  }, [ticket]);

  function handleSearchTicket() {
    const foundTicket = findDemoTicket(search);

    if (!foundTicket) {
      setTicket(null);
      setSuccessMessage(`Nenhum ticket encontrado para ${search.toUpperCase()}.`);
      setGateMessage("");
      setReceiptMessage("");
      return;
    }

    setTicket(foundTicket);
    setSuccessMessage(`Ticket localizado para a placa ${foundTicket.plate}.`);
    setGateMessage("");
    setReceiptMessage("");
  }

  function handleCalculate() {
    if (!ticket) {
      setSuccessMessage("Busque um ticket antes de calcular a permanencia.");
      return;
    }

    setTicket({
      ...ticket,
      amount: getTicketAmount(ticket),
      durationLabel: getTicketDuration(ticket),
    });

    setSuccessMessage("Valor calculado com sucesso em modo demonstracao.");
  }

  function handlePayment() {
    if (!ticket) {
      setSuccessMessage("Busque um ticket antes de confirmar pagamento.");
      return;
    }

    if (ticket.status === "exited") {
      setSuccessMessage("Este ticket ja teve a saida liberada.");
      return;
    }

    const result = confirmDemoPayment(ticket.code, paymentMethod);
    if (!result) {
      setSuccessMessage("Nao foi possivel confirmar o pagamento desse ticket.");
      return;
    }

    setTicket(result.ticket);
    setSuccessMessage(`Pagamento confirmado via ${paymentMethod}.`);
    setReceiptMessage(`Recibo digital gerado para o ticket ${result.ticket.code}.`);
  }

  function handleConfirmExit() {
    if (!ticket) {
      setSuccessMessage("Busque um ticket antes de liberar a saida.");
      return;
    }

    if (ticket.status === "open") {
      setSuccessMessage("Confirme o pagamento antes de liberar a saida.");
      return;
    }

    if (ticket.status === "exited") {
      setGateMessage("Saida ja liberada para este ticket.");
      return;
    }

    const result = releaseDemoExit(ticket.code);
    if (!result) {
      setSuccessMessage("Nao foi possivel liberar a saida desse ticket.");
      return;
    }

    setTicket(result.ticket);
    setGateMessage("Cancela de saida liberada com sucesso em modo demonstracao.");
    setSuccessMessage("Saida registrada no painel operacional.");
  }

  function handleCancel() {
    setSuccessMessage("");
    setGateMessage("");
    setReceiptMessage("");
  }

  const ticketAmount = getTicketAmount(ticket);
  const ticketDuration = getTicketDuration(ticket);
  const ticketStatus = getExitStatusLabel(ticket);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Operação de saída
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Confirmar saída</h1>
        <p className="mt-2 text-sm text-slate-500">
          Fluxo demonstrativo com busca de ticket, cálculo, pagamento, recibo e liberação da cancela.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="rounded-2xl border bg-transparent px-4 py-3"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Digite placa ou ticket"
          />
          <button
            onClick={handleSearchTicket}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Buscar ticket
          </button>
        </div>

        <div className="mt-6 rounded-3xl border p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Ticket</p>
              <h2 className="mt-1 text-2xl font-semibold">{ticket?.code ?? "Nao localizado"}</h2>
            </div>
            <span className="rounded-full border px-4 py-2 text-sm">
              {ticketStatus}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <p><span className="text-slate-500">Placa:</span> {ticket?.plate ?? "-"}</p>
            <p><span className="text-slate-500">Veículo:</span> {ticket?.model ?? "-"}</p>
            <p><span className="text-slate-500">Cliente:</span> {ticket?.customer ?? "-"}</p>
            <p><span className="text-slate-500">Entrada:</span> {ticket ? formatTimeLabel(ticket.entryAtISO) : "-"}</p>
            <p><span className="text-slate-500">Permanência:</span> {ticketDuration}</p>
            <p><span className="text-slate-500">Status PDV:</span> {paidLabel}</p>
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 p-5">
            <p className="text-sm text-slate-500">Total a pagar</p>
            <p className="mt-1 text-4xl font-bold">{formatCurrency(ticketAmount)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <select
            className="rounded-2xl border bg-transparent px-4 py-3"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            <option>Pix</option>
            <option>Cartão de crédito</option>
            <option>Cartão de débito</option>
            <option>Dinheiro</option>
            <option>Mensalista</option>
          </select>

          <button
            onClick={handleCalculate}
            className="rounded-2xl border px-5 py-3 hover:bg-white/10"
          >
            Calcular permanência
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handlePayment}
            className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Confirmar pagamento
          </button>
          <button
            onClick={handleConfirmExit}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Liberar saída
          </button>
          <button
            onClick={handleCancel}
            className="rounded-2xl border px-5 py-3 hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>

        {successMessage ? (
          <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {successMessage}
          </p>
        ) : null}

        {receiptMessage ? (
          <p className="mt-3 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-300">
            {receiptMessage}
          </p>
        ) : null}

        {gateMessage ? (
          <p className="mt-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
            {gateMessage}
          </p>
        ) : null}
      </section>

      <aside className="space-y-6">
        <section className="surface rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Imagem da câmera de saída
          </p>
          <div className="mt-4 flex h-56 items-center justify-center rounded-3xl border bg-gradient-to-br from-slate-900 to-cyan-900/60">
            <div className="text-center">
              <p className="text-2xl font-semibold">{ticket?.plate ?? "-----"}</p>
              <p className="mt-2 text-sm text-slate-400">
                OCR/LPR simulado com 98,9% de confiança
              </p>
            </div>
          </div>
        </section>

        <section className="surface rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Checklist operacional
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <p className="rounded-2xl border p-3">✓ Ticket localizado</p>
            <p className="rounded-2xl border p-3">✓ Permanência calculada</p>
            <p className="rounded-2xl border p-3">✓ PDV pronto para pagamento</p>
            <p className="rounded-2xl border p-3">✓ Cancela pronta para liberação</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
