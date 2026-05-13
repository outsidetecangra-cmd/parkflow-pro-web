import { TicketView } from "@/lib/types";
import { Panel } from "@/components/ui/panel";

export function TicketPanel({ ticket }: { ticket: TicketView }) {
  const rows = [
    ["Codigo do ticket", ticket.id],
    ["Placa", ticket.plate],
    ["Modelo", ticket.model],
    ["Cor", ticket.color],
    ["Cliente", ticket.customer],
    ["Condutor", ticket.driver],
    ["Patio", ticket.yard],
    ["Tabela", ticket.priceTable],
    ["Entrada", ticket.entryAt],
    ["Saida", ticket.exitAt ?? "-"],
    ["Permanencia", ticket.stayLabel],
    ["Observacoes", ticket.observations]
  ];

  return (
    <Panel>
      <h3 className="text-lg font-semibold">Dados do veiculo</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="mt-2 text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
