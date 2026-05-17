import { computePricing } from "@/app/api/operations/_shared";
import { requireUser } from "@/lib/server/auth";
import { jsonError, jsonOk } from "@/lib/server/http";
import { getSupabaseServerClient } from "@/lib/server/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return jsonError(auth.error.message, auth.error.status, auth.error.code);

  let body: {
    ticketCode?: string;
    unitId?: string;
    exitAt?: string;
    payment?: { method?: string; amount?: number; status?: string; reference?: string };
    discount?: { amount?: number; reason?: string };
    lpr?: { plate?: string; confidence?: number };
    gateId?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Payload invÃ¡lido", 400, "INVALID_EXIT_CONFIRM_PAYLOAD");
  }

  if (!body.ticketCode || !body.unitId || !body.exitAt) {
    return jsonError("ticketCode, unitId e exitAt sao obrigatorios", 400, "INVALID_EXIT_CONFIRM_PAYLOAD");
  }

  const supabase = getSupabaseServerClient();

  const ticketRes = await supabase
    .from("Ticket")
    .select("id,code,status,entryAt,vehicleId,priceTableId")
    .eq("code", body.ticketCode)
    .maybeSingle();

  if (ticketRes.error) return jsonError(`Falha ao buscar ticket: ${ticketRes.error.message}`, 500, "DB_ERROR");
  const ticket = ticketRes.data;
  if (!ticket) return jsonError("Ticket nao encontrado", 404, "TICKET_NOT_FOUND");

  const [vehicleRes, priceTableRes, rulesRes, paymentRes] = await Promise.all([
    ticket.vehicleId ? supabase.from("Vehicle").select("plate").eq("id", ticket.vehicleId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ticket.priceTableId ? supabase.from("PriceTable").select("graceMinutes,maxDaily").eq("id", ticket.priceTableId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ticket.priceTableId ? supabase.from("PriceRule").select("ruleType,value").eq("priceTableId", ticket.priceTableId) : Promise.resolve({ data: [], error: null }),
    supabase.from("Payment").select("id").eq("ticketId", ticket.id).order("createdAt", { ascending: false }).limit(1).maybeSingle()
  ]);

  if (vehicleRes.error) return jsonError(`Falha ao buscar veiculo: ${vehicleRes.error.message}`, 500, "DB_ERROR");
  if (priceTableRes.error) return jsonError(`Falha ao buscar tabela: ${priceTableRes.error.message}`, 500, "DB_ERROR");
  if (rulesRes.error) return jsonError(`Falha ao buscar regras: ${rulesRes.error.message}`, 500, "DB_ERROR");
  if (paymentRes.error) return jsonError(`Falha ao buscar pagamento: ${paymentRes.error.message}`, 500, "DB_ERROR");

  const exitAt = new Date(body.exitAt);
  const entryAt = new Date(ticket.entryAt as unknown as string);
  const manualDiscount = body.discount?.amount ?? 0;

  const firstHourRule = rulesRes.data?.find((rule) => rule.ruleType === "primeira_hora");
  const additionalFractionRule = rulesRes.data?.find((rule) => rule.ruleType === "fracao_adicional");

  const pricing = computePricing({
    entryAt,
    exitAt,
    graceMinutes: priceTableRes.data?.graceMinutes ?? 15,
    maxDaily: priceTableRes.data?.maxDaily !== null && priceTableRes.data?.maxDaily !== undefined ? Number(priceTableRes.data.maxDaily) : null,
    manualDiscount,
    firstHourValue: firstHourRule ? Number(firstHourRule.value) : undefined,
    nextHourValue: additionalFractionRule ? Number(additionalFractionRule.value) : undefined
  });

  const canExitWithoutPayment = ticket.status === "EXEMPT";
  const paymentStatus = body.payment?.status?.toUpperCase();
  if (!canExitWithoutPayment && paymentStatus !== "APPROVED") {
    return jsonError("A saida exige pagamento aprovado, isencao ou regra valida", 403, "PAYMENT_REQUIRED");
  }

  const lprMismatch = !!body.lpr?.plate && !!vehicleRes.data?.plate && body.lpr.plate !== vehicleRes.data.plate;

  const updateTicket = await supabase
    .from("Ticket")
    .update({
      unitId: body.unitId,
      status: "PAID",
      exitAt: exitAt.toISOString(),
      expectedAmount: pricing.originalAmount,
      finalAmount: pricing.finalAmount,
      paymentDeadline: new Date(exitAt.getTime() + 15 * 60000).toISOString()
    })
    .eq("id", ticket.id)
    .select("code,status,finalAmount")
    .single();

  if (updateTicket.error) return jsonError(`Falha ao atualizar ticket: ${updateTicket.error.message}`, 500, "DB_ERROR");

  const latestPayment = paymentRes.data ?? null;
  if (body.payment?.method && body.payment.amount !== undefined) {
    if (latestPayment?.id) {
      const updated = await supabase
        .from("Payment")
        .update({
          unitId: body.unitId,
          method: body.payment.method,
          amount: body.payment.amount,
          status: body.payment.status?.toLowerCase() ?? "approved",
          reference: body.payment.reference ?? null,
          origin: "WEB",
          paidAt: paymentStatus === "APPROVED" ? exitAt.toISOString() : null,
          metadata: { discountReason: body.discount?.reason ?? null }
        })
        .eq("id", latestPayment.id);
      if (updated.error) return jsonError(`Falha ao atualizar pagamento: ${updated.error.message}`, 500, "DB_ERROR");
    } else {
      const created = await supabase.from("Payment").insert({
        ticketId: ticket.id,
        unitId: body.unitId,
        method: body.payment.method,
        amount: body.payment.amount,
        status: body.payment.status?.toLowerCase() ?? "approved",
        reference: body.payment.reference ?? null,
        origin: "WEB",
        paidAt: paymentStatus === "APPROVED" ? exitAt.toISOString() : null,
        metadata: { discountReason: body.discount?.reason ?? null }
      });
      if (created.error) return jsonError(`Falha ao criar pagamento: ${created.error.message}`, 500, "DB_ERROR");
    }
  }

  const movement = await supabase.from("Movement").insert({
    ticketId: ticket.id,
    type: "EXIT_CONFIRMED",
    payload: { gateId: body.gateId ?? null, discount: body.discount ?? null, payment: body.payment ?? null, lpr: body.lpr ?? null }
  });
  if (movement.error) return jsonError(`Falha ao registrar movimento: ${movement.error.message}`, 500, "DB_ERROR");

  if (body.lpr?.plate) {
    const capture = await supabase.from("LprCapture").insert({
      ticketId: ticket.id,
      unitId: body.unitId,
      plate: body.lpr.plate,
      confidence: body.lpr.confidence ?? 0,
      direction: "saida",
      status: lprMismatch ? "divergente" : "validado"
    });
    if (capture.error) return jsonError(`Falha ao registrar LPR: ${capture.error.message}`, 500, "DB_ERROR");
  }

  let auditCreated = false;
  if (lprMismatch) {
    const audit = await supabase.from("AuditOccurrence").insert({
      unitId: body.unitId,
      type: "Placa divergente",
      severity: "alta",
      plate: body.lpr?.plate ?? null,
      ticketCode: ticket.code,
      status: "aberta",
      comment: "Leitura de placa divergente na confirmacao da saida."
    });
    if (audit.error) return jsonError(`Falha ao criar auditoria: ${audit.error.message}`, 500, "DB_ERROR");
    auditCreated = true;
  }

  return jsonOk({
    ticket: { code: updateTicket.data.code, status: updateTicket.data.status, finalAmount: Number(updateTicket.data.finalAmount ?? pricing.finalAmount) },
    gateAction: { allowed: true, command: "OPEN" },
    audit: { occurrenceCreated: auditCreated, reason: auditCreated ? "LPR_MISMATCH" : null }
  });
}
