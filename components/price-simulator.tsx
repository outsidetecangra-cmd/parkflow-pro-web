import { Panel } from "@/components/ui/panel";

export function PriceSimulator() {
  return (
    <Panel>
      <h3 className="text-lg font-semibold">Simulador de tabela</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="rounded-2xl border bg-transparent px-4 py-3" defaultValue="2026-05-13 08:00" />
        <input className="rounded-2xl border bg-transparent px-4 py-3" defaultValue="2026-05-13 12:45" />
      </div>
      <div className="mt-4 rounded-2xl bg-sky-600/10 p-4 text-sm">
        Regra aplicada: 1a hora R$ 12 + 3 fracoes de R$ 6, com tolerancia de 15 minutos.
      </div>
      <p className="mt-4 text-3xl font-semibold">Total simulado: R$ 30,00</p>
    </Panel>
  );
}
