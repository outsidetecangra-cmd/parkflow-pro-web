"use client";

import { useEffect, useMemo, useState } from "react";

import { getDemoState, resetDemoStore } from "@/lib/demo-store";

type ModuleKey =
  | "entrada"
  | "saida"
  | "patio"
  | "caixa"
  | "mensalistas"
  | "automacao"
  | "relatorios"
  | "erp";

type UserRole = "Admin" | "Operador" | "Financeiro" | "Supervisor";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Ativo" | "Bloqueado";
};

type SettingsState = {
  unitName: string;
  parkingLotName: string;
  priceTableName: string;
  apiUrl: string;
  autoBackup: boolean;
  requireOperatorPin: boolean;
  enableNotifications: boolean;
  modules: Record<ModuleKey, boolean>;
  users: DemoUser[];
};

const defaultSettings: SettingsState = {
  unitName: "Unidade Centro",
  parkingLotName: "Pátio principal",
  priceTableName: "Tabela padrão",
  apiUrl: "https://api.demo.parkflow.local",
  autoBackup: true,
  requireOperatorPin: true,
  enableNotifications: true,
  modules: {
    entrada: true,
    saida: true,
    patio: true,
    caixa: true,
    mensalistas: true,
    automacao: true,
    relatorios: true,
    erp: true,
  },
  users: [
    {
      id: "USR-001",
      name: "Administrador Demo",
      email: "admin.demo@example.invalid",
      role: "Admin",
      status: "Ativo",
    },
    {
      id: "USR-002",
      name: "Operador Entrada",
      email: "operador.demo@example.invalid",
      role: "Operador",
      status: "Ativo",
    },
    {
      id: "USR-003",
      name: "Financeiro Demo",
      email: "financeiro.demo@example.invalid",
      role: "Financeiro",
      status: "Ativo",
    },
  ],
};

const storageKey = "parkflow-demo-admin-settings";

function makeUserId() {
  const number = Math.floor(100 + Math.random() * 900);
  return `USR-${number}`;
}

function loadSettings(): SettingsState {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return defaultSettings;
  }

  try {
    return {
      ...defaultSettings,
      ...JSON.parse(saved),
    };
  } catch {
    return defaultSettings;
  }
}

export default function AdminConfiguracoesPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [message, setMessage] = useState("");
  const [newUserName, setNewUserName] = useState("Novo usuário demo");
  const [newUserEmail, setNewUserEmail] = useState("novo.usuario@example.invalid");
  const [newUserRole, setNewUserRole] = useState<UserRole>("Operador");

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const activeModules = useMemo(() => {
    return Object.values(settings.modules).filter(Boolean).length;
  }, [settings.modules]);

  const activeUsers = useMemo(() => {
    return settings.users.filter((user) => user.status === "Ativo").length;
  }, [settings.users]);

  function saveSettings(nextSettings: SettingsState, customMessage?: string) {
    setSettings(nextSettings);
    localStorage.setItem(storageKey, JSON.stringify(nextSettings));
    setMessage(customMessage ?? "Configurações salvas com sucesso no navegador.");
  }

  function updateField<K extends keyof SettingsState>(field: K, value: SettingsState[K]) {
    const nextSettings = {
      ...settings,
      [field]: value,
    };

    saveSettings(nextSettings, "Alteração salva automaticamente.");
  }

  function toggleModule(module: ModuleKey) {
    const nextSettings = {
      ...settings,
      modules: {
        ...settings.modules,
        [module]: !settings.modules[module],
      },
    };

    saveSettings(nextSettings, `Módulo ${module} atualizado.`);
  }

  function toggleUserStatus(userId: string) {
    const nextSettings = {
      ...settings,
      users: settings.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Ativo" ? ("Bloqueado" as const) : ("Ativo" as const),
            }
          : user
      ),
    };

    saveSettings(nextSettings, "Status do usuário atualizado.");
  }

  function addUser() {
    if (!newUserName || !newUserEmail) {
      setMessage("Informe nome e e-mail para cadastrar o usuário.");
      return;
    }

    const newUser: DemoUser = {
      id: makeUserId(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "Ativo",
    };

    const nextSettings = {
      ...settings,
      users: [newUser, ...settings.users],
    };

    saveSettings(nextSettings, `Usuário ${newUser.name} cadastrado com sucesso.`);
  }

  function runConnectionTest() {
    setMessage(`Conexão testada com sucesso em ${settings.apiUrl}.`);
  }

  function runBackup() {
    const backup = {
      generatedAt: new Date().toISOString(),
      settings,
      demoState: getDemoState(),
    };

    localStorage.setItem("parkflow-demo-backup", JSON.stringify(backup));
    setMessage("Backup local gerado com sucesso no navegador.");
  }

  function restoreDefaults() {
    saveSettings(defaultSettings, "Configurações restauradas para o padrão de demonstração.");
  }

  function resetDemoData() {
    resetDemoStore();
    setMessage("Dados demo resetados: tickets, pagamentos, caixa e pátio recriados.");
  }

  function exportSettings() {
    const fileContent = JSON.stringify(settings, null, 2);
    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "parkflow-configuracoes-demo.json";
    anchor.click();

    URL.revokeObjectURL(url);
    setMessage("Arquivo de configurações exportado.");
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Administração
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Configurações do sistema</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Tela funcional de demonstração com persistência em localStorage,
              controle de unidade, módulos, usuários, backup e conexão.
            </p>
          </div>

          <button
            onClick={exportSettings}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Exportar configurações
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Unidade</p>
            <p className="mt-2 text-xl font-bold">{settings.unitName}</p>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Módulos ativos</p>
            <p className="mt-2 text-2xl font-bold">{activeModules}/8</p>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Usuários ativos</p>
            <p className="mt-2 text-2xl font-bold">{activeUsers}</p>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500">Backup automático</p>
            <p className="mt-2 text-2xl font-bold">
              {settings.autoBackup ? "Ativo" : "Inativo"}
            </p>
          </div>
        </div>

        {message ? (
          <p className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-300">
            {message}
          </p>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Dados da operação</h2>
          <p className="mt-1 text-sm text-slate-500">
            Essas informações ficam salvas no navegador para a apresentação.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-500">Nome da unidade</span>
              <input
                value={settings.unitName}
                onChange={(event) => updateField("unitName", event.target.value)}
                className="w-full rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Pátio padrão</span>
              <input
                value={settings.parkingLotName}
                onChange={(event) => updateField("parkingLotName", event.target.value)}
                className="w-full rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Tabela padrão</span>
              <input
                value={settings.priceTableName}
                onChange={(event) => updateField("priceTableName", event.target.value)}
                className="w-full rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">URL da API</span>
              <input
                value={settings.apiUrl}
                onChange={(event) => updateField("apiUrl", event.target.value)}
                className="w-full rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              onClick={() => updateField("autoBackup", !settings.autoBackup)}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Backup: {settings.autoBackup ? "Ativo" : "Inativo"}
            </button>

            <button
              onClick={() => updateField("requireOperatorPin", !settings.requireOperatorPin)}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              PIN operador: {settings.requireOperatorPin ? "Ativo" : "Inativo"}
            </button>

            <button
              onClick={() => updateField("enableNotifications", !settings.enableNotifications)}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Notificações: {settings.enableNotifications ? "Ativas" : "Inativas"}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={runConnectionTest}
              className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Testar conexão
            </button>

            <button
              onClick={runBackup}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Gerar backup
            </button>

            <button
              onClick={restoreDefaults}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Restaurar padrão
            </button>

            <button
              onClick={resetDemoData}
              className="rounded-2xl border px-5 py-3 hover:bg-white/10"
            >
              Resetar dados demo
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="surface rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Módulos do sistema</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ative ou desative módulos da apresentação.
            </p>

            <div className="mt-5 grid gap-3">
              {(Object.keys(settings.modules) as ModuleKey[]).map((module) => (
                <button
                  key={module}
                  onClick={() => toggleModule(module)}
                  className="flex items-center justify-between rounded-2xl border p-4 text-left hover:bg-white/10"
                >
                  <span className="capitalize">{module}</span>
                  <span className="rounded-full border px-3 py-1 text-xs">
                    {settings.modules[module] ? "Ativo" : "Inativo"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Usuários e permissões</h2>
          <p className="mt-1 text-sm text-slate-500">
            Controle demonstrativo de usuários, perfis e bloqueio de acesso.
          </p>

          <div className="mt-5 space-y-3">
            {settings.users.map((user) => (
              <div key={user.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {user.id} · {user.email} · {user.role}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className="rounded-full border px-3 py-1 text-xs hover:bg-white/10"
                  >
                    {user.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Novo usuário</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre um usuário demonstrativo com perfil de acesso.
          </p>

          <div className="mt-5 grid gap-3">
            <input
              value={newUserName}
              onChange={(event) => setNewUserName(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Nome"
            />

            <input
              value={newUserEmail}
              onChange={(event) => setNewUserEmail(event.target.value)}
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="E-mail"
            />

            <select
              value={newUserRole}
              onChange={(event) => setNewUserRole(event.target.value as UserRole)}
              className="rounded-2xl border bg-transparent px-4 py-3"
            >
              <option>Admin</option>
              <option>Operador</option>
              <option>Financeiro</option>
              <option>Supervisor</option>
            </select>

            <button
              onClick={addUser}
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Cadastrar usuário
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

