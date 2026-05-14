"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const basePath = process.env.NODE_ENV === "production" ? "/parkflow-pro-web" : "";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin.demo@example.invalid");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setError("Informe e-mail e senha para acessar a demonstração.");
      return;
    }

    localStorage.setItem("parkflow-demo-auth", "true");
    localStorage.setItem("parkflow-demo-user", email);

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex justify-center">
            <Image
              src={`${basePath}/smartpark-logo.png`}
              alt="SmartPark"
              width={260}
              height={180}
              priority
              className="h-auto w-64 object-contain"
            />
          </div>

          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
            SmartPark
          </p>
          <h1 className="mt-3 text-3xl font-bold">Acesso demonstrativo</h1>
          <p className="mt-3 text-sm text-slate-300">
            Entre para visualizar o painel operacional do estacionamento.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">E-mail</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="admin.demo@example.invalid"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="123456"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Entrar no painel
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
          <p className="font-semibold">Dados para apresentação:</p>
          <p className="mt-1">E-mail: admin.demo@example.invalid</p>
          <p>Senha: 123456</p>
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-400">
            Dev. por WeBiFy Soluções
          </p>

          <Image
            src={`${basePath}/logo-webify.jpeg`}
            alt="WeBiFy Soluções"
            width={220}
            height={120}
            className="mx-auto h-auto w-44 rounded-2xl object-contain"
          />
        </div>
      </section>
    </main>
  );
}

