"use client";

import { useMemo, useState } from "react";

type FinanceItem = {
  id: string;
  type: "Receita" | "Despesa";
  description: string;
  category: string;
  status: "Pago" | "Pendente" | "Vencido";
  amount: number;
  dueDate: string;
};

const initialItems: FinanceItem[] = [
  {
    id: "FIN-001",
    type: "Receita",
    description: "Recebimento de tickets avulsos",
    category: "Operação",
    status: "Pago",
    amount: 2840,
    dueDate: "Hoje",
  },
  {
    id: "FIN-002",
    type: "Receita",
    description: "Mensalidades de contratos",
    category: "Mensalistas",
    status: "Pendente",
    amount: 1260,
    dueDate: "20/05/2026",
  },
  {
    id: "FIN-003",
    type: "Despesa",
    description: "Manutenção de cancela",
    category: "Automação",
    status: "Pendente",
    amount: 420,
    dueDate: "18/05/2026",
  },
  {
    id: "FIN-004",
    type: "Despesa",
    description: "Taxas operacionais",
    category: "Administrativo",
    status: "Pago",
    amount: 310,
    dueDate: "Ontem",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function makeFinanceId() {
  const number = Math.floor(100 + Math.random() * 900);
  return `FIN-${number}`;
}

export default function ErpFinanceiroPage() {
  const [items, setItems] = useState<FinanceItem[]>(initialItems);
  const [selected, setSelected] = useState<FinanceItem>(initialItems[0]);
  const [filter, setFilter] = useState("Todos");
  const [message, setMessage] = useState("");

  const [type, setType] = useState<"Receita" | "Despesa">("Receita");
  const [description, setDescription] = useState("Novo lançamento financeiro");
  const [category, setCategory] = useState("Operação");
  const [amount, setAmount] = useState("150");

  const filteredItems = useMemo(() => {
    if (filter === "Todos") {
      return items;
    }

    return items.filter((item) => item.status === filter || item.type === filter);
  }, [items, filter]);

  const totals = useMemo(() => {
    const revenue = items
      .filter((item) => item.type === "Receita")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = items
      .filter((item) => item.type === "Despesa")
      .reduce((sum, item) => sum + item.amount, 0);

    const pending = items
      .filter((item) => item.status === "Pendente" || item.status === "Vencido")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      revenue,
      expenses,
      balance: revenue - expenses,
      pending,
      total: items.length,
    };
  }, [items]);

  function handleAddItem() {
    const numericAmount = Number(amount.replace(",", "."));

    if (!description || !numericAmount || numericAmount <= 0) {
      setMessage("Preencha descrição e valor válido para criar o lançamento.");
      return;
    }

    const newItem: FinanceItem = {
      id: makeFinanceId(),
      type,
      description,
      category,
      status: "Pendente",
      amount: numericAmount,
      dueDate: "30/05/2026",
    };

    setItems((current) => [newItem, ...current]);
    setSelected(newItem);
    setMessage(`${type} cadastrada com sucesso: ${formatCurrency(numericAmount)}.`);
  }

  function handleMarkPaid() {
    const updated = {
      ...selected,
      status: "Pago" as const,
    };

    setSelected(updated);
    setItems((current) =>
      current.map((item) => (item.id === selected.id ? updated : item))
    );

    setMessage(`Lançamento ${selected.id} marcado como pago.`);
  }

  function handleDuplicate() {
    const duplicated: FinanceItem = {
      ...selected,
      id: makeFinanceId(),
      status: "Pendente",
      dueDate: "30/05/2026",
    };

    setItems((current) => [duplicated, ...current]);
    setSelected(duplicated);
    setMessage(`Lançamento ${duplicated.id} duplicado para demonstração.`);
  }

  function handleExport() {
    setMessage("Relatório financeiro exportado em modo demonstração.");
  }

  function handleConciliation() {
    setMessage("Conciliação financeira simulada com sucesso.");
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          ERP financeiro
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Gestão financeira</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Tela demonstrativa para receitas, despesas, contas a receber,
              contas a pagar, conciliação e exportação financeira.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Exportar financeiro
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Receitas</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Despesas</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.expenses)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Saldo</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.balance)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Pendências</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.pending)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Lançamentos</p>
            <p className="mt-2 text-2xl font-bold">{totals.total}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="surface rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Lançamentos financeiros</h2>
              <p className="mt-1 text-sm text-slate-500">
                Filtre e selecione lançamentos para executar ações.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
            >
              <option>Todos</option>
              <option>Receita</option>
              <option>Despesa</option>
              <option>Pago</option>
              <option>Pendente</option>
              <option>Vencido</option>
            </select>
          </div>

          <div className="mt-5 space-y-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  setMessage(`Lançamento ${item.id} selecionado.`);
                }}
                className="w-full rounded-2xl border p-4 text-left hover:bg-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.description}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.id} · {item.type} · {item.category} · {item.dueDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full border px-3 py-1 text-xs">
                      {item.status}
                    </span>
                    <p className="mt-2 font-bold">{formatCurrency(item.amount)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="surface rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Lançamento selecionado
            </p>

            <h2 className="mt-3 text-2xl font-semibold">{selected.description}</h2>

            <div className="mt-5 space-y-3 text-sm">
              <p><span className="text-slate-500">Código:</span> {selected.id}</p>
              <p><span className="text-slate-500">Tipo:</span> {selected.type}</p>
              <p><span className="text-slate-500">Categoria:</span> {selected.category}</p>
              <p><span className="text-slate-500">Status:</span> {selected.status}</p>
              <p><span className="text-slate-500">Vencimento:</span> {selected.dueDate}</p>
              <p><span className="text-slate-500">Valor:</span> {formatCurrency(selected.amount)}</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button
                onClick={handleMarkPaid}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Marcar pago
              </button>
              <button
                onClick={handleDuplicate}
                className="rounded-2xl border px-5 py-3 hover:bg-white/10"
              >
                Duplicar
              </button>
              <button
                onClick={handleConciliation}
                className="rounded-2xl border px-5 py-3 hover:bg-white/10"
              >
                Conciliar
              </button>
              <button
                onClick={handleExport}
                className="rounded-2xl border px-5 py-3 hover:bg-white/10"
              >
                Exportar
              </button>
            </div>

            {message ? (
              <p className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
                {message}
              </p>
            ) : null}
          </section>

          <section className="surface rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Novo lançamento</h2>

            <div className="mt-5 grid gap-3">
              <select
                value={type}
                onChange={(event) => setType(event.target.value as "Receita" | "Despesa")}
                className="rounded-2xl border bg-transparent px-4 py-3"
              >
                <option>Receita</option>
                <option>Despesa</option>
              </select>

              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
                placeholder="Descrição"
              />

              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
                placeholder="Categoria"
              />

              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
                placeholder="Valor"
              />

              <button
                onClick={handleAddItem}
                className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Cadastrar lançamento
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
