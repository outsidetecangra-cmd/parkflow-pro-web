"use client";

import { useEffect, useMemo, useState } from "react";

import {
  addDemoCashMovement,
  formatCurrency,
  formatTimeLabel,
  getDefaultDemoState,
  getDemoState,
  subscribeDemoStore,
  type DemoCashMovement,
  type DemoCashMovementType,
} from "@/lib/demo-store";

export default function CaixaPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [movements, setMovements] = useState<DemoCashMovement[]>(() =>
    getDefaultDemoState().cashMovements
  );
  const [description, setDescription] = useState("Pagamento ticket balcão");
  const [amount, setAmount] = useState("35");
  const [method, setMethod] = useState("Pix");
  const [type, setType] = useState<DemoCashMovementType>("Entrada");
  const [message, setMessage] = useState("");

  useEffect(() => {
    function refreshMovements() {
      setMovements(getDemoState().cashMovements);
    }

    refreshMovements();
    return subscribeDemoStore(refreshMovements);
  }, []);

  const totals = useMemo(() => {
    const entradas = movements
      .filter((item) => item.type === "Entrada")
      .reduce((sum, item) => sum + item.amount, 0);

    const saidas = movements
      .filter((item) => item.type === "Saída")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      totalMovimentos: movements.length,
    };
  }, [movements]);

  function handleAddMovement() {
    const numericAmount = Number(amount.replace(",", "."));

    if (!description || !numericAmount || numericAmount <= 0) {
      setMessage("Informe descrição e valor válido para lançar o movimento.");
      return;
    }

    const result = addDemoCashMovement({
      type,
      description,
      method,
      amount: numericAmount,
    });

    setMovements(result.state.cashMovements);
    setMessage(`${type} registrada com sucesso: ${formatCurrency(numericAmount)} via ${method}.`);
  }

  function handleOpenCashier() {
    setIsOpen(true);
    setMessage("Caixa aberto em modo demonstração.");
  }

  function handleCloseCashier() {
    setIsOpen(false);
    setMessage(`Caixa fechado. Saldo final demonstrativo: ${formatCurrency(totals.saldo)}.`);
  }

  function handleReceipt() {
    setMessage("Recibo digital gerado em modo demonstração.");
  }

  function handleReport() {
    setMessage("Relatório de fechamento gerado em modo demonstração.");
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Caixa e PDV
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Controle de caixa</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Tela demonstrativa para abertura, lançamentos, pagamentos, sangria,
              recibos e fechamento do caixa operacional.
            </p>
          </div>

          <span className="rounded-full border px-4 py-2 text-sm">
            {isOpen ? "Caixa aberto" : "Caixa fechado"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Entradas</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.entradas)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Saídas</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.saidas)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Saldo</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.saldo)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Movimentos</p>
            <p className="mt-2 text-2xl font-bold">{totals.totalMovimentos}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Novo lançamento</h2>
          <p className="mt-1 text-sm text-slate-500">
            Simule recebimentos, sangrias e ajustes de caixa.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as DemoCashMovementType)}
              className="rounded-2xl border bg-transparent px-4 py-3"
            >
              <option>Entrada</option>
              <option>Saída</option>
            </select>

            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
            >
              <option>Pix</option>
              <option>Cartão de crédito</option>
              <option>Cartão de débito</option>
              <option>Dinheiro</option>
              <option>Mensalista</option>
            </select>

            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3 md:col-span-2"
              placeholder="Descrição"
            />

            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Valor"
            />

            <button
              onClick={handleAddMovement}
              disabled={!isOpen}
              className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Registrar movimento
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={handleOpenCashier} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
              Abrir caixa
            </button>
            <button onClick={handleCloseCashier} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
              Fechar caixa
            </button>
            <button onClick={handleReceipt} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
              Gerar recibo
            </button>
            <button onClick={handleReport} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
              Relatório
            </button>
          </div>

          {message ? (
            <p className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
              {message}
            </p>
          ) : null}
        </section>

        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Movimentos recentes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Histórico operacional do caixa demonstrativo.
          </p>

          <div className="mt-5 space-y-3">
            {movements.map((movement) => (
              <div key={movement.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{movement.description}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {movement.id} · {movement.method} · {formatTimeLabel(movement.atISO)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full border px-3 py-1 text-xs">
                      {movement.type}
                    </span>
                    <p className="mt-2 font-bold">{formatCurrency(movement.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="surface rounded-3xl p-6">
        <h2 className="text-xl font-semibold">Resumo para apresentação</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <p className="rounded-2xl border p-4">✓ Pagamentos via Pix, cartão, dinheiro e mensalista</p>
          <p className="rounded-2xl border p-4">✓ Sangria e fechamento de caixa simulados</p>
          <p className="rounded-2xl border p-4">✓ Recibo e relatório demonstrativos</p>
        </div>
      </section>
    </div>
  );
}
