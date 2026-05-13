import { valetQueue } from "@/lib/mock-data";
import { Panel } from "@/components/ui/panel";

export function ValetQueueBoard() {
  return (
    <Panel>
      <h3 className="text-lg font-semibold">Fila de retirada</h3>
      <div className="mt-4 space-y-3">
        {valetQueue.map((request) => (
          <div key={request.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{request.customer}</p>
                <p className="text-sm text-slate-500">{request.plate} • {request.attendant}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{request.eta}</p>
                <p className="text-sm text-slate-500">{request.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
