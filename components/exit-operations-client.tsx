"use client";

import { useEffect, useState } from "react";
import { CameraPreview } from "@/components/camera-preview";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaymentPanel } from "@/components/payment-panel";
import { TicketPanel } from "@/components/ticket-panel";
import { VehicleCard } from "@/components/vehicle-card";
import {
  calculateExit,
  confirmExitRequest,
  fetchTicketByCode,
  fetchUserContext,
  getSession,
  toTicketView,
  type UserContext
} from "@/lib/api";
import type { TicketView } from "@/lib/types";

const defaultTicketCode = "TK-20260513-001";

export function ExitOperationsClient() {
  const [ticketCode, setTicketCode] = useState(defaultTicketCode);
  const [ticket, setTicket] = useState<TicketView | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [context, setContext] = useState<UserContext | null>(null);

  async function loadTicket(code: string) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const session = getSession();
      const search = await fetchTicketByCode(code);
      const calculation = await calculateExit(
        code,
        context?.activeUnit?.id ?? session?.user.allowedUnitIds?.[0]
      );
      setTicket(toTicketView({ search, calculation }));
      setAlerts(calculation.alerts.map((alert) => alert.message));
    } catch (loadError) {
      setTicket(null);
      setAlerts([]);
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar ticket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      const session = getSession();
      if (session?.accessToken) {
        try {
          const loadedContext = await fetchUserContext(session.accessToken);
          setContext(loadedContext);
        } catch {
          setContext(null);
        }
      }

      await loadTicket(defaultTicketCode);
    }

    void bootstrap();
  }, []);

  async function handleConfirmExit() {
    const session = getSession();

    if (!session?.accessToken || !ticket || !context?.activeUnit?.id) {
      setError("Sessao ou unidade ativa indisponivel para confirmar a saida.");
      return;
    }

    setConfirming(true);
    setError(null);
    setMessage(null);

    try {
      await confirmExitRequest({
        token: session.accessToken,
        ticketCode,
        unitId: context.activeUnit.id,
        exitAt: new Date().toISOString(),
        payment: {
          method: "pix",
          amount: ticket.finalAmount,
          status: "APPROVED",
          reference: `WEB-${ticket.id}`
        },
        lpr: {
          plate: ticket.plate,
          confidence: 98.4
        }
      });

      setMessage("Saida confirmada e cancela liberada.");
      await loadTicket(ticketCode);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Falha ao confirmar saida");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        {ticket ? <VehicleCard ticket={ticket} /> : <div className="surface rounded-3xl p-6">Nenhum ticket carregado.</div>}
        <div className="surface rounded-3xl p-5">
          <form
            className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void loadTicket(ticketCode);
            }}
          >
            <input
              className="rounded-2xl border bg-transparent px-4 py-4 text-lg"
              placeholder="Digite o ticket e pressione Enter"
              value={ticketCode}
              onChange={(event) => setTicketCode(event.target.value)}
            />
            <button className="rounded-2xl border px-4 py-4" type="submit">
              {loading ? "Buscando..." : "Buscar ticket"}
            </button>
            <button className="rounded-2xl border px-4 py-4" type="button">
              Buscar placa
            </button>
            <button className="rounded-2xl bg-sky-600 px-4 py-4 text-white" type="button">
              Entrada passe livre
            </button>
          </form>
          {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {ticket ? <TicketPanel ticket={ticket} /> : null}
          {ticket ? <PaymentPanel ticket={ticket} /> : null}
        </div>
        <div className="space-y-6">
          <CameraPreview title="Imagem da camera de saida" subtitle="Consulta operacional ligada na API central e calculo real de saida." />
          <ConfirmDialog
            title="Confirmar saida"
            description="Registra pagamento, confirma a saida, grava LPR e simula a abertura da cancela."
            confirmLabel={confirming ? "Confirmando..." : "Confirmar saida"}
            onConfirm={handleConfirmExit}
            disabled={!ticket || confirming}
          />
          <div className="surface rounded-3xl p-5">
            <h3 className="text-lg font-semibold">Observacoes operacionais</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              {alerts.length > 0 ? alerts.map((alert) => <li key={alert}>{alert}</li>) : <li>Sem alertas para este ticket.</li>}
              <li>Status PDV refletido do ultimo pagamento vinculado.</li>
              <li>Busca operacional carregada da API central em tempo real.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
