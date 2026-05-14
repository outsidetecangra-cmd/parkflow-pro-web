import { LprCapture } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status-badge";

export function LprCaptureCard({ capture }: { capture: LprCapture }) {
  const tone = capture.status === "validado" ? "success" : capture.status === "divergente" ? "danger" : "warning";

  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{capture.camera}</p>
          <h3 className="mt-2 text-xl font-semibold">{capture.plate}</h3>
        </div>
        <StatusBadge label={capture.status} tone={tone} />
      </div>
      <p className="mt-4 text-sm">Confianca: {capture.confidence}%</p>
      <p className="mt-1 text-sm">Sentido: {capture.direction}</p>
      <p className="mt-1 text-sm text-slate-500">{formatDateTime(capture.timestamp)}</p>
    </Panel>
  );
}

