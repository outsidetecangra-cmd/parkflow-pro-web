import { jsonError, jsonOk } from "@/lib/server/http";
import { getSupabaseServerClient } from "@/lib/server/supabase";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001/api";

function buildUrl(pathname: string) {
  return `${API_BASE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function ensurePricingConfig() {
  const supabase = getSupabaseServerClient();

  const active = await supabase
    .from("PriceTable")
    .select("id,name,graceMinutes,maxDaily,active")
    .eq("active", true)
    .order("name")
    .limit(1)
    .maybeSingle();

  if (active.error) throw new Error(active.error.message);
  let priceTable = active.data ?? null;

  if (!priceTable) {
    const any = await supabase.from("PriceTable").select("id,name,graceMinutes,maxDaily,active").order("name").limit(1).maybeSingle();
    if (any.error) throw new Error(any.error.message);
    priceTable = any.data ?? null;
  }

  if (!priceTable) {
    const created = await supabase
      .from("PriceTable")
      .insert({ name: "Tabela PadrÃ£o", type: "PADRAO", active: true, graceMinutes: 15, maxDaily: null })
      .select("id,name,graceMinutes,maxDaily,active")
      .single();
    if (created.error) throw new Error(created.error.message);
    priceTable = created.data;

    const rulesInsert = await supabase.from("PriceRule").insert([
      { priceTableId: priceTable.id, name: "Primeira Hora", ruleType: "primeira_hora", value: 12 },
      { priceTableId: priceTable.id, name: "FraÃ§Ã£o Adicional (Hora)", ruleType: "fracao_adicional", value: 6 }
    ]);
    if (rulesInsert.error) throw new Error(rulesInsert.error.message);
  }

  const rules = await supabase.from("PriceRule").select("ruleType,value").eq("priceTableId", priceTable.id);
  if (rules.error) throw new Error(rules.error.message);

  const firstHourRule = rules.data?.find((rule) => rule.ruleType === "primeira_hora");
  const additionalFractionRule = rules.data?.find((rule) => rule.ruleType === "fracao_adicional");

  return {
    priceTableId: priceTable.id,
    name: priceTable.name,
    graceMinutes: priceTable.graceMinutes ?? 0,
    maxDaily: priceTable.maxDaily !== null && priceTable.maxDaily !== undefined ? Number(priceTable.maxDaily) : null,
    firstHour: firstHourRule ? Number(firstHourRule.value) : 12,
    additionalFraction: additionalFractionRule ? Number(additionalFractionRule.value) : 6
  };
}

export async function GET() {
  try {
    if (hasSupabaseEnv()) {
      return jsonOk(await ensurePricingConfig());
    }

    const response = await fetch(buildUrl("/pricing"), {
      method: "GET",
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao buscar precificaÃ§Ã£o.";
    return jsonError(message, 502, "PRICING_UNAVAILABLE");
  }
}

export async function PUT(request: Request) {
  const bodyText = await request.text();

  try {
    if (hasSupabaseEnv()) {
      const parsed = JSON.parse(bodyText) as {
        firstHour?: number;
        additionalFraction?: number;
        graceMinutes?: number;
        maxDaily?: number | null;
      };

      const supabase = getSupabaseServerClient();
      const current = await ensurePricingConfig();

      const updateTable = await supabase
        .from("PriceTable")
        .update({
          graceMinutes: typeof parsed.graceMinutes === "number" ? parsed.graceMinutes : current.graceMinutes,
          maxDaily: parsed.maxDaily === null || typeof parsed.maxDaily === "number" ? parsed.maxDaily : current.maxDaily
        })
        .eq("id", current.priceTableId);

      if (updateTable.error) throw new Error(updateTable.error.message);

      async function upsertRule(ruleType: string, name: string, value: number) {
        const existing = await supabase
          .from("PriceRule")
          .select("id")
          .eq("priceTableId", current.priceTableId)
          .eq("ruleType", ruleType)
          .maybeSingle();

        if (existing.error) throw new Error(existing.error.message);

        if (existing.data?.id) {
          const updated = await supabase.from("PriceRule").update({ value }).eq("id", existing.data.id);
          if (updated.error) throw new Error(updated.error.message);
        } else {
          const created = await supabase.from("PriceRule").insert({ priceTableId: current.priceTableId, name, ruleType, value });
          if (created.error) throw new Error(created.error.message);
        }
      }

      if (typeof parsed.firstHour === "number") {
        await upsertRule("primeira_hora", "Primeira Hora", parsed.firstHour);
      }

      if (typeof parsed.additionalFraction === "number") {
        await upsertRule("fracao_adicional", "FraÃ§Ã£o Adicional (Hora)", parsed.additionalFraction);
      }

      return jsonOk({ message: "ConfiguraÃ§Ãµes de preÃ§o atualizadas com sucesso" });
    }

    const response = await fetch(buildUrl("/pricing"), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: bodyText
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao atualizar precificaÃ§Ã£o.";
    return jsonError(message, 502, "PRICING_UNAVAILABLE");
  }
}

