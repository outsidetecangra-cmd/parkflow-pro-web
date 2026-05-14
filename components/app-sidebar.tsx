import Link from "next/link";
import type { Route } from "next";
import { LayoutDashboard, CarFront, Wallet, Users, Building2, Radar, FileBarChart2, Settings } from "lucide-react";

const groups = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operacao/entrada", label: "Entrada", icon: CarFront },
  { href: "/operacao/saida", label: "Saida", icon: CarFront },
  { href: "/caixa", label: "Caixa", icon: Wallet },
  { href: "/mensalistas", label: "Mensalistas", icon: Users },
  { href: "/automacao/equipamentos", label: "Automacao", icon: Radar },
  { href: "/erp/financeiro", label: "ERP", icon: Building2 },
  { href: "/relatorios", label: "Relatorios", icon: FileBarChart2 },
  { href: "/admin/configuracoes", label: "Admin", icon: Settings }
] as const satisfies ReadonlyArray<{
  href: Route;
  label: string;
  icon: typeof LayoutDashboard;
}>;

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-white/10 bg-slate-950 px-6 py-8 text-slate-200 lg:flex">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Parkflow Pro</p>
        <h1 className="mt-3 text-2xl font-semibold">Operacao inteligente</h1>
        <p className="mt-2 text-sm text-slate-400">Estacionamento, pagamentos, auditoria e ERP em uma unica camada operacional.</p>
      </div>
      <nav className="mt-10 space-y-2">
        {groups.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-4">
        <p className="text-sm font-medium">Status global</p>
        <p className="mt-1 text-sm text-slate-300">17 equipamentos online, 3 filas ativas e 2 ocorrencias criticas.</p>
      </div>
    </aside>
  );
}

