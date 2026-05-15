"use client";

import { useEffect, useState } from "react";
import { fetchPricingConfigs, updatePricingConfigs } from "@/lib/api";

type PricingState = {
  firstHour: number;
  additionalFraction: number;
  graceMinutes: number;
  maxDaily: number | null;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrency(value: string) {
  const numeric = value.replace(/\D/g, "");
  return Number(numeric) / 100;
}

export default function AdminPrecosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [pricing, setPricing] = useState<PricingState>({
    firstHour: 12,
    additionalFraction: 6,
    graceMinutes: 15,
    maxDaily: null,
  });

  useEffect(() => {
    loadPricing();
  }, []);

  async function loadPricing() {
    try {
      setLoading(true);
      const data = await fetchPricingConfigs();
      setPricing({
        firstHour: data.firstHour,
        additionalFraction: data.additionalFraction,
        graceMinutes: data.graceMinutes,
        maxDaily: data.maxDaily,
      });
      setMessage(null);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Falha ao carregar as configurações de preços.";
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await updatePricingConfigs(pricing);
      setMessage({ text: "Preços atualizados com sucesso!", type: "success" });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Falha ao atualizar as configurações de preços.";
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof PricingState>(field: K, value: PricingState[K]) {
    setPricing((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Administração
        </p>

        <div className="mt-3">
          <h1 className="text-3xl font-semibold">Tabela de Preços</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Configure os valores cobrados no pátio e tempos de tolerância.
            Essas regras serão aplicadas aos próximos tickets finalizados.
          </p>
        </div>

        {message ? (
          <div
            className={`mt-5 rounded-2xl border p-4 text-sm ${
              message.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-400/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <form onSubmit={handleSave} className="mt-8 space-y-6 max-w-2xl">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-500">Valor 1ª Hora (R$)</span>
              <input
                type="text"
                required
                value={formatCurrency(pricing.firstHour)}
                onChange={(e) => updateField("firstHour", parseCurrency(e.target.value))}
                className="w-full rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Valor Fração Adicional (Hora) (R$)</span>
              <input
                type="text"
                required
                value={formatCurrency(pricing.additionalFraction)}
                onChange={(e) => updateField("additionalFraction", parseCurrency(e.target.value))}
                className="w-full rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Tempo de Tolerância (minutos)</span>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={pricing.graceMinutes}
                onChange={(e) => updateField("graceMinutes", parseInt(e.target.value) || 0)}
                className="w-full rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-500">Diária Máxima (R$)</span>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={pricing.maxDaily === null ? "" : formatCurrency(pricing.maxDaily)}
                  onChange={(e) => {
                    const val = parseCurrency(e.target.value);
                    updateField("maxDaily", val);
                  }}
                  disabled={pricing.maxDaily === null}
                  className="w-full rounded-2xl border bg-transparent px-4 py-3 disabled:opacity-50"
                  placeholder="Sem teto máximo"
                />
                <button
                  type="button"
                  onClick={() => updateField("maxDaily", pricing.maxDaily === null ? 50 : null)}
                  className="rounded-2xl border px-4 py-3 hover:bg-white/10 text-sm whitespace-nowrap"
                >
                  {pricing.maxDaily === null ? "Habilitar" : "Remover"}
                </button>
              </div>
            </label>
          </div>

          <div className="flex justify-end border-t border-white/10 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
