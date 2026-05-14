"use client";

import { useMemo, useState } from "react";

type MonthlyCustomer = {
  id: string;
  name: string;
  plate: string;
  plan: string;
  status: "Ativo" | "Vencendo" | "Bloqueado";
  value: number;
  dueDate: string;
  spot: string;
};

const initialCustomers: MonthlyCustomer[] = [
  {
    id: "MEN-001",
    name: "Cliente Corporativo A",
    plate: "DEMO101",
    plan: "Mensal Executivo",
    status: "Ativo",
    value: 280,
    dueDate: "20/05/2026",
    spot: "A-12",
  },
  {
    id: "MEN-002",
    name: "Contrato Residencial B",
    plate: "DEMO102",
    plan: "Mensal 24h",
    status: "Vencendo",
    value: 220,
    dueDate: "16/05/2026",
    spot: "B-04",
  },
  {
    id: "MEN-003",
    name: "Cliente VIP C",
    plate: "DEMO103",
    plan: "Mensal Premium",
    status: "Ativo",
    value: 350,
    dueDate: "28/05/2026",
    spot: "C-01",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function makeCustomerId() {
  const number = Math.floor(100 + Math.random() * 900);
  return `MEN-${number}`;
}

export default function MensalistasPage() {
  const [customers, setCustomers] = useState<MonthlyCustomer[]>(initialCustomers);
  const [selected, setSelected] = useState<MonthlyCustomer>(initialCustomers[0]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("Novo mensalista demo");
  const [plate, setPlate] = useState("DEMO200");
  const [plan, setPlan] = useState("Mensal Executivo");
  const [value, setValue] = useState("250");
  const [spot, setSpot] = useState("D-10");

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.plate.toLowerCase().includes(term) ||
        customer.plan.toLowerCase().includes(term) ||
        customer.status.toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

  const totals = useMemo(() => {
    const active = customers.filter((item) => item.status === "Ativo").length;
    const expiring = customers.filter((item) => item.status === "Vencendo").length;
    const blocked = customers.filter((item) => item.status === "Bloqueado").length;
    const revenue = customers.reduce((sum, item) => sum + item.value, 0);

    return {
      active,
      expiring,
      blocked,
      revenue,
      total: customers.length,
    };
  }, [customers]);

  function handleAddCustomer() {
    const numericValue = Number(value.replace(",", "."));

    if (!name || !plate || !numericValue) {
      setMessage("Preencha nome, placa e valor para cadastrar o mensalista.");
      return;
    }

    const newCustomer: MonthlyCustomer = {
      id: makeCustomerId(),
      name,
      plate: plate.toUpperCase(),
      plan,
      status: "Ativo",
      value: numericValue,
      dueDate: "30/05/2026",
      spot,
    };

    setCustomers((current) => [newCustomer, ...current]);
    setSelected(newCustomer);
    setMessage(`Mensalista ${newCustomer.name} cadastrado com sucesso.`);
  }

  function handleRenew() {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === selected.id
          ? {
              ...customer,
              status: "Ativo",
              dueDate: "30/06/2026",
            }
          : customer
      )
    );

    setSelected((current) => ({
      ...current,
      status: "Ativo",
      dueDate: "30/06/2026",
    }));

    setMessage(`Contrato ${selected.id} renovado ate 30/06/2026.`);
  }

  function handleBlock() {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === selected.id
          ? {
              ...customer,
              status: "Bloqueado",
            }
          : customer
      )
    );

    setSelected((current) => ({
      ...current,
      status: "Bloqueado",
    }));

    setMessage(`Mensalista ${selected.name} bloqueado em modo demonstracao.`);
  }

  function handleCharge() {
    setMessage(`Cobranca de ${formatCurrency(selected.value)} gerada para ${selected.name}.`);
  }

  function handleSendNotice() {
    setMessage(`Aviso enviado para ${selected.name} em modo demonstracao.`);
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Gestao de mensalistas
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Mensalistas e contratos</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Tela demonstrativa para cadastro, renovacao, cobranca, bloqueio e controle
              de contratos mensais.
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar mensalista, placa ou plano"
            className="w-full rounded-2xl border bg-transparent px-4 py-3 text-sm md:w-80"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-bold">{totals.total}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Ativos</p>
            <p className="mt-2 text-2xl font-bold">{totals.active}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Vencendo</p>
            <p className="mt-2 text-2xl font-bold">{totals.expiring}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Bloqueados</p>
            <p className="mt-2 text-2xl font-bold">{totals.blocked}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Receita mensal</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Lista de mensalistas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Clique em um contrato para ver detalhes e executar acoes.
          </p>

          <div className="mt-5 space-y-3">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => {
                  setSelected(customer);
                  setMessage(`Contrato ${customer.id} selecionado.`);
                }}
                className="w-full rounded-2xl border p-4 text-left hover:bg-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {customer.id} · {customer.plate} · {customer.plan}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full border px-3 py-1 text-xs">
                      {customer.status}
                    </span>
                    <p className="mt-2 font-bold">{formatCurrency(customer.value)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="surface rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Contrato selecionado
            </p>
            <h2 className="mt-3 text-2xl font-semibold">{selected.name}</h2>

            <div className="mt-5 space-y-3 text-sm">
              <p><span className="text-slate-500">Contrato:</span> {selected.id}</p>
              <p><span className="text-slate-500">Placa:</span> {selected.plate}</p>
              <p><span className="text-slate-500">Plano:</span> {selected.plan}</p>
              <p><span className="text-slate-500">Status:</span> {selected.status}</p>
              <p><span className="text-slate-500">Vencimento:</span> {selected.dueDate}</p>
              <p><span className="text-slate-500">Vaga:</span> {selected.spot}</p>
              <p><span className="text-slate-500">Valor:</span> {formatCurrency(selected.value)}</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button onClick={handleRenew} className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
                Renovar
              </button>
              <button onClick={handleCharge} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
                Gerar cobranca
              </button>
              <button onClick={handleSendNotice} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
                Enviar aviso
              </button>
              <button onClick={handleBlock} className="rounded-2xl border px-5 py-3 hover:bg-white/10">
                Bloquear
              </button>
            </div>

            {message ? (
              <p className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
                {message}
              </p>
            ) : null}
          </section>

          <section className="surface rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Novo mensalista</h2>
            <div className="mt-5 grid gap-3">
              <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border bg-transparent px-4 py-3" placeholder="Nome" />
              <input value={plate} onChange={(event) => setPlate(event.target.value)} className="rounded-2xl border bg-transparent px-4 py-3" placeholder="Placa" />
              <input value={plan} onChange={(event) => setPlan(event.target.value)} className="rounded-2xl border bg-transparent px-4 py-3" placeholder="Plano" />
              <input value={value} onChange={(event) => setValue(event.target.value)} className="rounded-2xl border bg-transparent px-4 py-3" placeholder="Valor" />
              <input value={spot} onChange={(event) => setSpot(event.target.value)} className="rounded-2xl border bg-transparent px-4 py-3" placeholder="Vaga" />
              <button onClick={handleAddCustomer} className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400">
                Cadastrar mensalista
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
