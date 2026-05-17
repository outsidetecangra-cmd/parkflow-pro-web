import { computePricing } from "@/app/api/operations/_shared";
import { jsonError, jsonOk } from "@/lib/server/http";
import { getSupabaseServerClient } from "@/lib/server/supabase";

export async function POST(request: Request) {
  let body: {
    ticketCode?: string;
    unitId?: string;
    exitAt?: string;
    couponCode?: string | null;
    partnerValidationCode?: string | null;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Payload invÃ¡lido", 400, "INVALID_EXIT_CALCULATION_PAYLOAD");
  }

  if (!body.ticketCode) {
    return jsonError("ticketCode e obrigatorio", 400, "INVALID_EXIT_CALCULATION_PAYLOAD");
  }

  const supabase = getSupabaseServerClient();

  const ticketRes = await supabase
    .from("Ticket")
    .select("id,code,status,unitId,entryAt,vehicleId,priceTableId")
    .eq("code", body.ticketCode)
    .maybeSingle();

  if (ticketRes.error) return jsonError(`Falha ao buscar ticket: ${ticketRes.error.message}`, 500, "DB_ERROR");
  const ticket = ticketRes.data;
  if (!ticket) return jsonError("Ticket nao encontrado", 404, "TICKET_NOT_FOUND");

  if (ticket.unitId && body.unitId && ticket.unitId !== body.unitId) {
    return jsonError("O ticket nao pertence a unidade informada", 403, "UNIT_SCOPE_MISMATCH");
  }

  const [vehicleRes, priceTableRes, rulesRes] = await Promise.all([
    ticket.vehicleId ? supabase.from("Vehicle").select("plate").eq("id", ticket.vehicleId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ticket.priceTableId ? supabase.from("PriceTable").select("graceMinutes,maxDaily").eq("id", ticket.priceTableId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ticket.priceTableId ? supabase.from("PriceRule").select("ruleType,value").eq("priceTableId", ticket.priceTableId) : Promise.resolve({ data: [], error: null })
  ]);

  if (vehicleRes.error) return jsonError(`Falha ao buscar veiculo: ${vehicleRes.error.message}`, 500, "DB_ERROR");
  if (priceTableRes.error) return jsonError(`Falha ao buscar tabela: ${priceTableRes.error.message}`, 500, "DB_ERROR");
  if (rulesRes.error) return jsonError(`Falha ao buscar regras: ${rulesRes.error.message}`, 500, "DB_ERROR");

  const exitAt = body.exitAt ? new Date(body.exitAt) : new Date();
  const entryAt = new Date(ticket.entryAt as unknown as string);

  const firstHourRule = rulesRes.data?.find((rule) => rule.ruleType === "primeira_hora");
  const additionalFractionRule = rulesRes.data?.find((rule) => rule.ruleType === "fracao_adicional");

  const pricing = computePricing({
    entryAt,
    exitAt,
    graceMinutes: priceTableRes.data?.graceMinutes ?? 15,
    maxDaily: priceTableRes.data?.maxDaily !== null && priceTableRes.data?.maxDaily !== undefined ? Number(priceTableRes.data.maxDaily) : null,
    couponCode: body.couponCode,
    partnerValidationCode: body.partnerValidationCode,
    firstHourValue: firstHourRule ? Number(firstHourRule.value) : undefined,
    nextHourValue: additionalFractionRule ? Number(additionalFractionRule.value) : undefined
  });

  const latestCapture = await supabase
    .from("LprCapture")
    .select("plate,createdAt")
    .eq("ticketId", ticket.id)
    .eq("direction", "saida")
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestCapture.error) return jsonError(`Falha ao buscar LPR: ${latestCapture.error.message}`, 500, "DB_ERROR");

  const alerts =
    latestCapture.data && vehicleRes.data?.plate && latestCapture.data.plate !== vehicleRes.data.plate
      ? [{ code: "LPR_MISMATCH", message: "Leitura de placa divergente na saida" }]
      : [];

  return jsonOk({
    ticket: { code: ticket.code, status: ticket.status, stayMinutes: pricing.stayMinutes },
    pricing,
    alerts
  });
}

