"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  SunMoon,
  LayoutDashboard,
  CarFront,
  Wallet,
  Users,
  Radar,
  Building2,
  FileBarChart2,
  Settings,
} from "lucide-react";
import {
  clearSession,
  fetchUserContext,
  getSession,
  type UserContext,
} from "@/lib/api";

const mobileLinks = [
  { href: "/dashboard", label: "Dash", icon: LayoutDashboard, match: "/dashboard" },
  { href: "/operacao/entrada", label: "Entrada", icon: CarFront, match: "/operacao/entrada" },
  { href: "/operacao/saida", label: "Saída", icon: CarFront, match: "/operacao/saida" },
  { href: "/caixa", label: "Caixa", icon: Wallet, match: "/caixa" },
  { href: "/mensalistas", label: "Mensal", icon: Users, match: "/mensalistas" },
  { href: "/automacao/equipamentos", label: "Auto", icon: Radar, match: "/automacao" },
  { href: "/erp/financeiro", label: "ERP", icon: Building2, match: "/erp" },
  { href: "/relatorios", label: "Relat.", icon: FileBarChart2, match: "/relatorios" },
  { href: "/admin/configuracoes", label: "Admin", icon: Settings, match: "/admin" },
];

function isRouteActive(pathname: string, match: string) {
  return pathname === match || pathname.startsWith(`${match}/`);
}

export function TopbarContext() {
  const pathname = usePathname();
  const [context, setContext] = useState<UserContext | null>(null);

  useEffect(() => {
    const session = getSession();

    if (!session?.accessToken) {
      return;
    }

    fetchUserContext(session.accessToken)
      .then(setContext)
      .catch(() => {
        clearSession();
      });
  }, []);

  return (
    <>
      <nav className="fixed left-0 top-0 z-40 flex h-screen w-[62px] flex-col gap-1 overflow-y-auto border-r border-white/10 bg-slate-950/95 px-1.5 py-2 backdrop-blur lg:hidden">
        {mobileLinks.map(({ href, label, icon: Icon, match }) => {
          const active = isRouteActive(pathname, match);

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[48px] flex-col items-center justify-center rounded-xl border px-1 py-1 text-center text-[8px] font-medium leading-none transition ${
                active
                  ? "border-cyan-400/70 bg-cyan-500/25 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon className="mb-1 h-3.5 w-3.5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-white/85 px-3 py-2 backdrop-blur dark:bg-slate-950/95 lg:static lg:px-6 lg:py-4">
        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="hidden text-xs uppercase tracking-[0.3em] text-slate-500 lg:block">
              Central operacional
            </p>

            <h2 className="truncate text-sm font-semibold leading-tight lg:mt-1 lg:text-xl">
              <span className="lg:hidden">Dashboard</span>
              <span className="hidden lg:inline">Visão unificada da operação</span>
            </h2>

            {context ? (
              <p className="mt-1 hidden truncate text-sm text-slate-500 lg:block">
                {context.user.name} • {context.activeUnit?.name ?? "Sem unidade ativa"}
              </p>
            ) : null}
          </div>

          <div className="hidden w-full min-w-0 items-center gap-3 lg:flex lg:w-auto lg:flex-1 lg:justify-end">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 dark:bg-slate-900 lg:max-w-md">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
                placeholder="Buscar ticket, placa, cliente, RPS..."
              />
            </label>

            <button className="grid place-items-center rounded-2xl border border-[hsl(var(--border))] p-3 transition hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </button>

            <button className="grid place-items-center rounded-2xl border border-[hsl(var(--border))] p-3 transition hover:bg-white/10">
              <SunMoon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
