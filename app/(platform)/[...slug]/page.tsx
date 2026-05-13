import { AuditTimeline } from "@/components/audit-timeline";
import { DataTable } from "@/components/data-table";
import { KioskLayout } from "@/components/kiosk-layout";
import { LprCaptureCard } from "@/components/lpr-capture-card";
import { MobileOperatorLayout } from "@/components/mobile-operator-layout";
import { PriceSimulator } from "@/components/price-simulator";
import { StatCard } from "@/components/stat-card";
import { ValetQueueBoard } from "@/components/valet-queue-board";
import { genericRoutes, lprCaptures } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(genericRoutes).map((key) => ({
    slug: key.split("/")
  }));
}

export default function GenericModulePage({ params }: { params: { slug: string[] } }) {
  const key = params.slug.join("/");
  const config = genericRoutes[key];

  if (!config) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Modulo</p>
        <h1 className="mt-3 text-3xl font-semibold">{config.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-500">{config.description}</p>
      </section>
      {config.metrics ? (
        <section className="grid gap-4 md:grid-cols-3">
          {config.metrics.map((metric) => (
            <StatCard key={metric.label} stat={metric} />
          ))}
        </section>
      ) : null}
      {key === "tabelas-preco" ? <PriceSimulator /> : null}
      {key === "ocr/capturas" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lprCaptures.map((capture) => (
            <LprCaptureCard key={capture.id} capture={capture} />
          ))}
        </section>
      ) : null}
      {key === "auditoria/ocorrencias" ? <AuditTimeline /> : null}
      {key === "totem" ? <KioskLayout /> : null}
      {key === "mobile-operador" ? <MobileOperatorLayout /> : null}
      {key === "valet/fila" ? <ValetQueueBoard /> : null}
      {config.table ? <DataTable title="Resumo operacional" columns={config.table.columns} rows={config.table.rows} /> : null}
    </div>
  );
}
