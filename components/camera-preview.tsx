import { Panel } from "@/components/ui/panel";

export function CameraPreview({
  title,
  subtitle
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="h-56 bg-[linear-gradient(135deg,#0f172a,#1e293b,#0ea5e9)]" />
      <div className="p-5">
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>
    </Panel>
  );
}
