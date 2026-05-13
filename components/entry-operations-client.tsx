"use client";

import { useEffect, useState } from "react";
import { CameraPreview } from "@/components/camera-preview";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Panel } from "@/components/ui/panel";
import { VehicleCard } from "@/components/vehicle-card";
import {
  createEntryRequest,
  fetchUserContext,
  getSession,
  type UserContext
} from "@/lib/api";
import { tickets } from "@/lib/mock-data";
import type { TicketView } from "@/lib/types";

const previewTicket = tickets[1];

type EntryFormState = {
  plate: string;
  vehicleModel: string;
  vehicleColor: string;
  customerName: string;
  driverName: string;
  spotCode: string;
  notes: string;
};

export function EntryOperationsClient() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latestTicket, setLatestTicket] = useState<TicketView>(previewTicket);
  const [form, setForm] = useState<EntryFormState>({
    plate: "QWE1R23",
    vehicleModel: "Honda HR-V",
    vehicleColor: "Branco",
    customerName: "Cliente avulso",
    driverName: "Cliente avulso",
    spotCode: "A-01",
    notes: ""
  });

  useEffect(() => {
    async function loadContext() {
      const session = getSession();
      if (!session?.accessToken) return;

      try {
        const response = await fetchUserContext(session.accessToken);
        setContext(response);
      } catch {
        setContext(null);
      }
    }

    void loadContext();
  }, []);

  function updateForm<K extends keyof EntryFormState>(field: K, value: EntryFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateEntry() {
    const session = getSession();

    if (!session?.accessToken || !context?.activeUnit?.id) {
      setError("Sessao ou unidade ativa indisponivel para registrar a entrada.");
      return;
    }

    if (!context.operationDefaults.parkingLotId || !context.operationDefaults.priceTableId) {
      setError("A unidade ativa nao possui patio ou tabela padrao configurados.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await createEntryRequest({
        token: session.accessToken,
        unitId: context.activeUnit.id,
        plate: form.plate,
        vehicleModel: form.vehicleModel,
        vehicleColor: form.vehicleColor,
        customerType: "AVULSO",
        customerName: form.customerName,
        yardId: context.operationDefaults.parkingLotId,
        spotCode: form.spotCode,
        priceTableId: context.operationDefaults.priceTableId,
        terminalId: context.operationDefaults.terminalId ?? undefined,
        cameraId: context.operationDefaults.cameraId ?? undefined,
        notes: form.notes,
        origin: "WEB",
        lpr: {
          plate: form.plate,
          confidence: 97.9
        }
      });

      setLatestTicket({
        id: response.ticket.code,
        plate: form.plate,
        model: form.vehicleModel,
        color: form.vehicleColor,
        customer: form.customerName,
        driver: form.driverName,
        type: "Avulso",
        yard: context.operationDefaults.parkingLotName ?? "Patio padrao",
        spot: form.spotCode || "-",
        priceTable: context.operationDefaults.priceTableName ?? "Tabela padrao",
        entryAt: response.ticket.entryAt,
        stayLabel: "0h 00m",
        amount: 0,
        discount: 0,
        finalAmount: 0,
        paymentStatus: "Aguardando pagamento",
        validationStatus: "Entrada registrada",
        observations: form.notes || "Sem observacoes.",
        gateIn: context.operationDefaults.terminalName ?? "Terminal padrao",
        cameraInImage: "/camera-entry.svg",
        status: "Em aberto"
      });

      setSuccessMessage(`Entrada registrada com ticket ${response.ticket.code}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao registrar entrada");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <VehicleCard ticket={latestTicket} />
        <Panel>
          <h3 className="text-lg font-semibold">Registrar entrada</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Placa"
              value={form.plate}
              onChange={(event) => updateForm("plate", event.target.value.toUpperCase())}
            />
            <input
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Modelo"
              value={form.vehicleModel}
              onChange={(event) => updateForm("vehicleModel", event.target.value)}
            />
            <input
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Cor"
              value={form.vehicleColor}
              onChange={(event) => updateForm("vehicleColor", event.target.value)}
            />
            <input
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Cliente"
              value={form.customerName}
              onChange={(event) => updateForm("customerName", event.target.value)}
            />
            <input
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Condutor"
              value={form.driverName}
              onChange={(event) => updateForm("driverName", event.target.value)}
            />
            <input
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Vaga"
              value={form.spotCode}
              onChange={(event) => updateForm("spotCode", event.target.value)}
            />
            <input
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Patio"
              value={context?.operationDefaults.parkingLotName ?? ""}
              disabled
            />
            <input
              className="rounded-2xl border bg-transparent px-4 py-3"
              placeholder="Tabela de preco"
              value={context?.operationDefaults.priceTableName ?? ""}
              disabled
            />
          </div>
          <textarea
            className="mt-3 min-h-28 w-full rounded-2xl border bg-transparent px-4 py-3"
            placeholder="Observacoes, avarias e servicos adicionais"
            value={form.notes}
            onChange={(event) => updateForm("notes", event.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {["Gerar ticket", "Gerar QR Code", "Simular OCR/LPR", "Abrir cancela", "Recibo digital"].map((action) => (
              <button key={action} className="rounded-2xl border px-4 py-3 text-sm" type="button">
                {action}
              </button>
            ))}
          </div>
          {successMessage ? <p className="mt-4 text-sm text-emerald-600">{successMessage}</p> : null}
          {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
        </Panel>
      </div>
      <div className="space-y-6">
        <CameraPreview title="Camera de entrada" subtitle="Captura operacional vinculada ao endpoint real de entrada e contexto da unidade." />
        <ConfirmDialog
          title="Liberar entrada"
          description="Valida contexto da unidade, registra ticket, QR Code, LPR e libera a cancela simulada."
          confirmLabel={submitting ? "Registrando..." : "Registrar entrada"}
          onConfirm={handleCreateEntry}
          disabled={submitting}
        />
      </div>
    </div>
  );
}
