import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-slate-950 p-10 text-white">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">Parkflow Pro</p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight">
            Gestao moderna para operacoes de estacionamento de alta rotatividade.
          </h1>
          <p className="mt-5 max-w-2xl text-slate-300">
            Entrada, saida, OCR/LPR, autoatendimento, caixa, fiscal, ERP e auditoria em uma unica
            plataforma responsiva.
          </p>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}

