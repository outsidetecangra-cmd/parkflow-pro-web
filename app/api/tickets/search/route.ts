import { jsonError, jsonOk } from "@/lib/server/http";
import { getSupabaseServerClient } from "@/lib/server/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketCode = searchParams.get("ticketCode") ?? undefined;
  const plate = searchParams.get("plate") ?? undefined;
  const qrCode = searchParams.get("qrCode") ?? undefined;

  if (!ticketCode && !plate && !qrCode) {
    return jsonError("Informe ticketCode, plate ou qrCode", 400, "INVALID_TICKET_QUERY");
  }

  const supabase = getSupabaseServerClient();

  let ticketId: string | null = null;
  let ticketRow:
    | null
    | {
        id: string;
        code: string;
        status: string;
        entryAt: string;
        vehicleId: string | null;
        customerId: string | null;
        parkingLotId: string | null;
        priceTableId: string | null;
      } = null;

  if (ticketCode) {
    const { data, error } = await supabase
      .from("Ticket")
      .select("id,code,status,entryAt,vehicleId,customerId,parkingLotId,priceTableId")
      .eq("code", ticketCode)
      .maybeSingle();
    if (error) return jsonError(`Falha ao buscar ticket: ${error.message}`, 500, "DB_ERROR");
    ticketRow = data ?? null;
  } else if (qrCode) {
    const { data, error } = await supabase
      .from("Ticket")
      .select("id,code,status,entryAt,vehicleId,customerId,parkingLotId,priceTableId")
      .eq("qrCode", qrCode)
      .maybeSingle();
    if (error) return jsonError(`Falha ao buscar ticket: ${error.message}`, 500, "DB_ERROR");
    ticketRow = data ?? null;
  } else if (plate) {
    const { data: vehicle, error: vehicleError } = await supabase.from("Vehicle").select("id").eq("plate", plate).maybeSingle();
    if (vehicleError) return jsonError(`Falha ao buscar veiculo: ${vehicleError.message}`, 500, "DB_ERROR");
    if (vehicle?.id) {
      const { data, error } = await supabase
        .from("Ticket")
        .select("id,code,status,entryAt,vehicleId,customerId,parkingLotId,priceTableId")
        .eq("vehicleId", vehicle.id)
        .order("entryAt", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return jsonError(`Falha ao buscar ticket: ${error.message}`, 500, "DB_ERROR");
      ticketRow = data ?? null;
    }
  }

  if (!ticketRow) return jsonError("Ticket nao encontrado", 404, "TICKET_NOT_FOUND");
  ticketId = ticketRow.id;

  const [vehicleRes, customerRes, yardRes, priceTableRes, paymentRes] = await Promise.all([
    ticketRow.vehicleId ? supabase.from("Vehicle").select("plate,model").eq("id", ticketRow.vehicleId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ticketRow.customerId ? supabase.from("Customer").select("name").eq("id", ticketRow.customerId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ticketRow.parkingLotId ? supabase.from("ParkingLot").select("name").eq("id", ticketRow.parkingLotId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ticketRow.priceTableId ? supabase.from("PriceTable").select("name").eq("id", ticketRow.priceTableId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase.from("Payment").select("status,createdAt").eq("ticketId", ticketId).order("createdAt", { ascending: false }).limit(1).maybeSingle()
  ]);

  if (paymentRes.error) return jsonError(`Falha ao buscar pagamento: ${paymentRes.error.message}`, 500, "DB_ERROR");

  const latestPayment = paymentRes.data ?? null;

  return jsonOk({
    ticket: {
      id: ticketRow.id,
      code: ticketRow.code,
      status: ticketRow.status,
      type: "AVULSO",
      plate: vehicleRes.data?.plate ?? null,
      vehicleModel: vehicleRes.data?.model ?? null,
      customerName: customerRes.data?.name ?? null,
      entryAt: ticketRow.entryAt,
      yardName: yardRes.data?.name ?? null,
      spotCode: null,
      priceTableName: priceTableRes.data?.name ?? null,
      paymentStatus: latestPayment?.status?.toUpperCase?.() ? latestPayment.status.toUpperCase() : "PENDING",
      validationStatus: latestPayment ? "PAYMENT_REGISTERED" : "NOT_VALIDATED"
    }
  });
}

