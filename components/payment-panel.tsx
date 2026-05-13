import { TicketView } from "@/lib/types";
import { currency } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status-badge";

export function PaymentPanel({ ticket }: { ticket: TicketView }) {
  const shortcuts = ["F1 Confirmar", "F2 Patio", "F3 Buscar placa", "F4 Convenio", "F5 Tabelas", "F6 Desconto", "F10 Pagamento"];

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pagamento e liberacao</h3>
        <StatusBadge label={ticket.paymentStatus} tone={ticket.status === "Pago" ? "success" : "warning"} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Valor original</p>
          <p className="mt-1 text-2xl font-semibold">{currency(ticket.amount)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Valor final</p>
          <p className="mt-1 text-2xl font-semibold">{currency(ticket.finalAmount)}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <p>Desconto: {currency(ticket.discount)}</p>
        <p>Validacao PDV: {ticket.validationStatus}</p>
        <p>Limite de saida apos pagamento: 15 min</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {shortcuts.map((shortcut) => (
          <button key={shortcut} className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs">
            {shortcut}
          </button>
        ))}
      </div>
    </Panel>
  );
}
