"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/panel";
import { loginRequest, saveSession } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("admin.demo@example.invalid");
  const [password, setPassword] = useState("troque-esta-senha");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await loginRequest(login, password);
      saveSession(session);
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel className="p-8">
      <h2 className="text-3xl font-semibold">Entrar</h2>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-2xl border bg-transparent px-4 py-3"
          placeholder="E-mail ou usuario"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
        />
        <input
          className="w-full rounded-2xl border bg-transparent px-4 py-3"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <select className="w-full rounded-2xl border bg-transparent px-4 py-3" defaultValue="Shopping Atlante">
          <option>Shopping Atlante</option>
          <option>Aeroporto Norte</option>
          <option>Arena Cidade</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <input type="checkbox" defaultChecked />
          Lembrar acesso
        </label>
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <button
          className="w-full rounded-2xl bg-sky-600 px-4 py-3 font-medium text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Entrando..." : "Acessar painel"}
        </button>
        <button className="w-full rounded-2xl border px-4 py-3" type="button">
          Recuperar senha
        </button>
      </form>
    </Panel>
  );
}

