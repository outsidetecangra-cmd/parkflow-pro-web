import { jsonError, jsonOk } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { getSupabaseServerClient } from "@/lib/server/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return jsonError(auth.error.message, auth.error.status, auth.error.code);

  let body: {
    unitId?: string;
    origin?: string;
    plate?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    yardId?: string;
    priceTableId?: string;
    terminalId?: string;
    cameraId?: string;
    lpr?: { plate?: string; confidence?: number };
    notes?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Payload invÃ¡lido", 400, "INVALID_ENTRY_PAYLOAD");
  }

  if (!body.unitId || !body.plate || !body.yardId || !body.priceTableId) {
    return jsonError("unitId, plate, yardId e priceTableId sao obrigatorios", 400, "INVALID_ENTRY_PAYLOAD");
  }

  const supabase = getSupabaseServerClient();

  const [unitRes, yardRes, priceTableRes, vehicleRes] = await Promise.all([
    supabase.from("Unit").select("id").eq("id", body.unitId).maybeSingle(),
    supabase.from("ParkingLot").select("id,unitId,name").eq("id", body.yardId).maybeSingle(),
    supabase.from("PriceTable").select("id,unitId").eq("id", body.priceTableId).maybeSingle(),
    supabase.from("Vehicle").select("id,plate,model,color,customerId").eq("plate", body.plate).maybeSingle()
  ]);

  if (unitRes.error) return jsonError(`Falha ao consultar unidade: ${unitRes.error.message}`, 500, "DB_ERROR");
  if (yardRes.error) return jsonError(`Falha ao consultar patio: ${yardRes.error.message}`, 500, "DB_ERROR");
  if (priceTableRes.error) return jsonError(`Falha ao consultar tabela: ${priceTableRes.error.message}`, 500, "DB_ERROR");
  if (vehicleRes.error) return jsonError(`Falha ao consultar veiculo: ${vehicleRes.error.message}`, 500, "DB_ERROR");

  if (!unitRes.data || !yardRes.data || !priceTableRes.data) {
    return jsonError("Unidade, patio ou tabela de preco nao encontrados", 404, "ENTRY_DEPENDENCY_NOT_FOUND");
  }

  if (yardRes.data.unitId !== unitRes.data.id || (priceTableRes.data.unitId && priceTableRes.data.unitId !== unitRes.data.id)) {
    return jsonError("Patio ou tabela de preco nao pertencem a unidade informada", 403, "UNIT_SCOPE_MISMATCH");
  }

  const existingVehicle = vehicleRes.data ?? null;

  if (existingVehicle?.id) {
    const openTicket = await supabase
      .from("Ticket")
      .select("id")
      .eq("status", "OPEN")
      .eq("vehicleId", existingVehicle.id)
      .limit(1)
      .maybeSingle();

    if (openTicket.error) return jsonError(`Falha ao verificar ticket: ${openTicket.error.message}`, 500, "DB_ERROR");
    if (openTicket.data) return jsonError("A placa ja possui uma entrada em aberto", 403, "OPEN_TICKET_ALREADY_EXISTS");
  }

  const credential = await supabase
    .from("Credential")
    .select("validUntil")
    .eq("plate", body.plate)
    .order("validUntil", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (credential.error) return jsonError(`Falha ao verificar credencial: ${credential.error.message}`, 500, "DB_ERROR");
  if (credential.data?.validUntil) {
    const validUntil = new Date(credential.data.validUntil as unknown as string);
    if (validUntil.getTime() < Date.now()) {
      return jsonError("Credencial vencida", 403, "EXPIRED_CREDENTIAL");
    }
  }

  if (existingVehicle?.customerId) {
    const monthly = await supabase
      .from("MonthlyCustomer")
      .select("status")
      .eq("customerId", existingVehicle.customerId)
      .maybeSingle();

    if (monthly.error) return jsonError(`Falha ao verificar mensalista: ${monthly.error.message}`, 500, "DB_ERROR");
    if (monthly.data?.status === "inadimplente") {
      return jsonError("Mensalista inadimplente bloqueado para entrada", 403, "MONTHLY_CUSTOMER_IN_DEFAULT");
    }
  }

  const vehicle =
    existingVehicle ??
    (
      await supabase
        .from("Vehicle")
        .insert({ plate: body.plate, model: body.vehicleModel ?? "Nao informado", color: body.vehicleColor ?? null })
        .select("id,customerId")
        .single()
    ).data;

  if (!vehicle) return jsonError("Falha ao criar veiculo", 500, "DB_ERROR");

  const ticketCode = `TK-${Date.now()}`;
  const qrCode = `QR-${ticketCode}`;
  const entryAt = new Date().toISOString();

  const ticketInsert = await supabase
    .from("Ticket")
    .insert({
      code: ticketCode,
      unitId: unitRes.data.id,
      status: "OPEN",
      vehicleId: vehicle.id,
      customerId: vehicle.customerId ?? null,
      parkingLotId: yardRes.data.id,
      priceTableId: priceTableRes.data.id,
      entryAt,
      paymentDeadline: null,
      origin: body.origin ?? "WEB",
      qrCode,
      notes: body.notes ?? null
    })
    .select("id,code,status,entryAt,qrCode")
    .single();

  if (ticketInsert.error) return jsonError(`Falha ao criar ticket: ${ticketInsert.error.message}`, 500, "DB_ERROR");

  const movementInsert = await supabase.from("Movement").insert({
    ticketId: ticketInsert.data.id,
    type: "ENTRY_REGISTERED",
    payload: {
      plate: body.plate,
      patio: yardRes.data.name,
      terminalId: body.terminalId ?? null,
      cameraId: body.cameraId ?? null,
      lpr: body.lpr ?? null
    }
  });

  if (movementInsert.error) return jsonError(`Falha ao registrar movimento: ${movementInsert.error.message}`, 500, "DB_ERROR");

  if (body.cameraId && body.lpr?.plate) {
    const captureInsert = await supabase.from("LprCapture").insert({
      ticketId: ticketInsert.data.id,
      cameraId: body.cameraId,
      unitId: unitRes.data.id,
      plate: body.lpr.plate,
      confidence: body.lpr.confidence ?? 0,
      direction: "entrada",
      status: "validado"
    });
    if (captureInsert.error) return jsonError(`Falha ao registrar LPR: ${captureInsert.error.message}`, 500, "DB_ERROR");
  }

  return jsonOk({
    ticket: ticketInsert.data,
    gateAction: { allowed: true, reason: null }
  });
}
