import { paymentMethods } from "@/lib/mock-data";
import { currency } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";

export function CashSummary() {
  return (
    <Panel>
      <h3 className="text-lg font-semibold">Ranking de recebimentos</h3>
      <div className="mt-4 space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
            <div>
              <p className="font-medium">{method.name}</p>
              <p className="text-sm text-slate-500">{method.count} transacoes</p>
            </div>
            <p className="font-semibold">{currency(method.total)}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
