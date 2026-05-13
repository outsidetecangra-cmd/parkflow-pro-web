import { Panel } from "@/components/ui/panel";

export function KioskLayout() {
  return (
    <Panel className="bg-slate-950 p-8 text-white">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Autoatendimento</p>
      <h3 className="mt-4 text-3xl font-semibold">Pague seu ticket em segundos</h3>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <button className="rounded-3xl bg-cyan-500 px-4 py-6 text-left">Buscar por QR Code</button>
        <button className="rounded-3xl bg-white/10 px-4 py-6 text-left">Buscar por ticket</button>
        <button className="rounded-3xl bg-white/10 px-4 py-6 text-left">Buscar por placa</button>
      </div>
    </Panel>
  );
}
