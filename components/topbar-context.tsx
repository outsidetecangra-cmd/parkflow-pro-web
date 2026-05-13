"use client";

import { useEffect, useState } from "react";
import { Bell, Search, SunMoon } from "lucide-react";
import { clearSession, fetchUserContext, getSession, type UserContext } from "@/lib/api";

export function TopbarContext() {
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
    <header className="flex flex-col gap-4 border-b border-[hsl(var(--border))] bg-white/60 px-4 py-4 backdrop-blur dark:bg-slate-950/30 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Central operacional</p>
        <h2 className="text-xl font-semibold">Visao unificada da operacao</h2>
        {context ? (
          <p className="mt-1 text-sm text-slate-500">
            {context.user.name} • {context.activeUnit?.name ?? "Sem unidade ativa"}
          </p>
        ) : null}
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <label className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 dark:bg-slate-900">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Buscar ticket, placa, cliente, RPS..." />
        </label>
        <button className="rounded-2xl border border-[hsl(var(--border))] p-3">
          <Bell className="h-4 w-4" />
        </button>
        <button className="rounded-2xl border border-[hsl(var(--border))] p-3">
          <SunMoon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
