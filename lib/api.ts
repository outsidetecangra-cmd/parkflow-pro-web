import { TicketView } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001/api";
const STORAGE_KEY = "parkflow.session";

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    role: string | null;
    allowedUnitIds: string[];
  };
};

export type UserContext = {
  user: {
    id: string;
    name: string;
    role: string | null;
  };
  activeUnit: {
    id: string;
    name: string;
  } | null;
  operationDefaults: {
    parkingLotId: string | null;
    parkingLotName: string | null;
    priceTableId: string | null;
    priceTableName: string | null;
    cameraId: string | null;
    cameraName: string | null;
    terminalId: string | null;
    terminalName: string | null;
  };
  permissions: string[];
  allowedUnits: Array<{
    id: string;
    name: string;
    isDefault: boolean;
  }>;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export function saveSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StoredSession) : null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function loginRequest(login: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password })
  });

  const payload = (await response.json()) as ApiEnvelope<StoredSession> & {
    error?: { message: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Falha ao autenticar");
  }

  return payload.data;
}

export async function fetchUserContext(token: string) {
  const response = await fetch(`${API_BASE_URL}/me/context`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const payload = (await response.json()) as ApiEnvelope<UserContext> & {
    error?: { message: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Falha ao carregar contexto");
  }

  return payload.data;
}

export async function fetchTicketByCode(ticketCode: string) {
  const response = await fetch(`${API_BASE_URL}/tickets/search?ticketCode=${encodeURIComponent(ticketCode)}`);
  const payload = (await response.json()) as ApiEnvelope<{
    ticket: {
      id: string;
      code: string;
      status: string;
      type: string;
      plate: string | null;
      vehicleModel: string | null;
      customerName: string | null;
      entryAt: string;
      yardName: string | null;
      spotCode: string | null;
      priceTableName: string | null;
      paymentStatus: string;
      validationStatus: string;
    };
  }> & {
    error?: { message: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Falha ao buscar ticket");
  }

  return payload.data.ticket;
}

export async function calculateExit(ticketCode: string, unitId?: string) {
  const response = await fetch(`${API_BASE_URL}/operations/exit/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticketCode,
      unitId,
      exitAt: new Date().toISOString()
    })
  });

  const payload = (await response.json()) as ApiEnvelope<{
    ticket: {
      code: string;
      status: string;
      stayMinutes: number;
    };
    pricing: {
      originalAmount: number;
      discountAmount: number;
      extraAmount: number;
      finalAmount: number;
      appliedRules: string[];
    };
    alerts: Array<{
      code: string;
      message: string;
    }>;
  }> & {
    error?: { message: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Falha ao calcular saida");
  }

  return payload.data;
}

export async function createEntryRequest(input: {
  token: string;
  unitId: string;
  plate: string;
  vehicleModel?: string;
  vehicleColor?: string;
  customerType?: string;
  customerName?: string;
  yardId: string;
  spotCode?: string;
  priceTableId: string;
  terminalId?: string;
  cameraId?: string;
  notes?: string;
  origin?: string;
  lpr?: {
    plate?: string;
    confidence?: number;
  };
}) {
  const response = await fetch(`${API_BASE_URL}/operations/entry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.token}`
    },
    body: JSON.stringify(input)
  });

  const payload = (await response.json()) as ApiEnvelope<{
    ticket: {
      id: string;
      code: string;
      status: string;
      entryAt: string;
      qrCode: string;
    };
    gateAction: {
      allowed: boolean;
      reason: string | null;
    };
  }> & {
    error?: { message: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Falha ao registrar entrada");
  }

  return payload.data;
}

export async function confirmExitRequest(input: {
  token: string;
  ticketCode: string;
  unitId: string;
  exitAt: string;
  payment: {
    method: string;
    amount: number;
    status: string;
    reference?: string;
  };
  discount?: {
    amount?: number;
    reason?: string;
  };
  lpr?: {
    plate?: string;
    confidence?: number;
  };
  gateId?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/operations/exit/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.token}`
    },
    body: JSON.stringify(input)
  });

  const payload = (await response.json()) as ApiEnvelope<{
    ticket: {
      code: string;
      status: string;
      finalAmount: number;
    };
    gateAction: {
      allowed: boolean;
      command: string;
    };
    audit: {
      occurrenceCreated: boolean;
      reason: string | null;
    };
  }> & {
    error?: { message: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Falha ao confirmar saida");
  }

  return payload.data;
}

export function toTicketView(input: {
  search: Awaited<ReturnType<typeof fetchTicketByCode>>;
  calculation?: Awaited<ReturnType<typeof calculateExit>>;
}): TicketView {
  const search = input.search;
  const calc = input.calculation;
  const stayMinutes = calc?.ticket.stayMinutes ?? 0;
  const hours = Math.floor(stayMinutes / 60);
  const minutes = stayMinutes % 60;

  return {
    id: search.code,
    plate: search.plate ?? "-",
    model: search.vehicleModel ?? "Nao informado",
    color: "-",
    customer: search.customerName ?? "Sem cliente",
    driver: search.customerName ?? "Nao informado",
    type: search.type === "AVULSO" ? "Avulso" : "Convenio",
    yard: search.yardName ?? "-",
    spot: search.spotCode ?? "-",
    priceTable: search.priceTableName ?? "-",
    entryAt: search.entryAt,
    exitAt: new Date().toISOString(),
    stayLabel: `${hours}h ${minutes}m`,
    amount: calc?.pricing.originalAmount ?? 0,
    discount: calc?.pricing.discountAmount ?? 0,
    finalAmount: calc?.pricing.finalAmount ?? 0,
    paymentStatus: search.paymentStatus,
    validationStatus: search.validationStatus,
    observations: calc?.alerts.map((alert) => alert.message).join(" | ") || "Sem observacoes.",
    gateIn: "Entrada automatizada",
    gateOut: "Saida automatizada",
    cameraInImage: "/camera-entry.svg",
    cameraOutImage: "/camera-exit.svg",
    status:
      search.status === "OPEN"
        ? "Em aberto"
        : search.status === "PAID"
          ? "Pago"
          : search.status === "EXEMPT"
            ? "Isento"
            : "Finalizado"
  };
}
