import { auditOccurrences } from "@/lib/mock-data";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status-badge";

export function AuditTimeline() {
  return (
    <Panel>
      <h3 className="text-lg font-semibold">Ocorrencias recentes</h3>
      <div className="mt-4 space-y-4">
        {auditOccurrences.map((occurrence) => (
          <div key={occurrence.id} className="rounded-2xl border border-[hsl(var(--border))] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{occurrence.type}</p>
                <p className="text-sm text-slate-500">{occurrence.plate} â€¢ {occurrence.ticket}</p>
              </div>
              <StatusBadge label={occurrence.status} tone={occurrence.severity === "alta" ? "danger" : "warning"} />
            </div>
            <p className="mt-3 text-sm text-slate-500">{occurrence.comment}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

