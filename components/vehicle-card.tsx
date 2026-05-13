import { TicketView } from "@/lib/types";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status-badge";

export function VehicleCard({ ticket }: { ticket: TicketView }) {
  return (
    <Panel className="bg-gradient-to-br from-slate-950 to-slate-800 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{ticket.plate}</p>
          <h3 className="mt-3 text-2xl font-semibold">{ticket.model}</h3>
          <p className="mt-1 text-sm text-slate-300">{ticket.customer}</p>
        </div>
        <StatusBadge label={ticket.status} tone={ticket.status === "Em aberto" ? "warning" : "success"} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div>
          <p className="text-slate-500">Patio</p>
          <p>{ticket.yard}</p>
        </div>
        <div>
          <p className="text-slate-500">Vaga</p>
          <p>{ticket.spot}</p>
        </div>
        <div>
          <p className="text-slate-500">Entrada</p>
          <p>{ticket.entryAt.slice(11, 16)}</p>
        </div>
        <div>
          <p className="text-slate-500">Permanencia</p>
          <p>{ticket.stayLabel}</p>
        </div>
      </div>
    </Panel>
  );
}
