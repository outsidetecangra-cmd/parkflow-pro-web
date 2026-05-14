import { Panel } from "@/components/ui/panel";

export function MobileOperatorLayout() {
  return (
    <Panel className="max-w-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">PDV Portatil</p>
      <h3 className="mt-3 text-xl font-semibold">Saida rapida em campo</h3>
      <div className="mt-4 space-y-3">
        <button className="w-full rounded-2xl bg-sky-600 px-4 py-4 text-white">Escanear QR Code</button>
        <button className="w-full rounded-2xl border px-4 py-4">Ler placa</button>
        <button className="w-full rounded-2xl border px-4 py-4">Receber no Pix</button>
      </div>
    </Panel>
  );
}

