import { Device } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status-badge";

export function GateStatusCard({ device }: { device: Device }) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{device.type}</p>
          <h3 className="mt-2 font-semibold">{device.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{device.unit}</p>
        </div>
        <StatusBadge label={device.status} tone={device.status === "online" ? "success" : "danger"} />
      </div>
      <p className="mt-4 text-sm">IP: {device.ip}</p>
      <p className="mt-1 text-sm text-slate-500">Ultimo sinal: {formatDateTime(device.lastSignal)}</p>
    </Panel>
  );
}

