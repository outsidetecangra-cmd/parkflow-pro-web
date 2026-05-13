import { DashboardStat } from "@/lib/types";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status-badge";

export function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <Panel className="min-h-32 bg-white/90 dark:bg-slate-950/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{stat.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</p>
        </div>
        <StatusBadge label={stat.tone ?? "info"} tone={stat.tone ?? "info"} />
      </div>
      {stat.delta ? <p className="mt-4 text-sm text-slate-500">{stat.delta}</p> : null}
    </Panel>
  );
}
