export type DemoTicketStatus = "Em aberto" | "Aguardando pagamento" | "Pago" | "Saída liberada";

export type DemoTicket = {
  code: string;
  plate: string;
  model: string;
  color: string;
  customer: string;
  yard: string;
  priceTable: string;
  entryAtISO: string;
  exitAtISO?: string;
  durationLabel?: string;
  amount?: number;
  status: DemoTicketStatus;
  paymentMethod?: string;
  paidAtISO?: string;
};

export type DemoPayment = {
  id: string;
  ticketCode: string;
  method: string;
  amount: number;
  atISO: string;
};

type DemoDb = {
  version: 1;
  tickets: DemoTicket[];
  payments: DemoPayment[];
};

const DEMO_DB_KEY = "smartpark_demo_db_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeParseJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function defaultDb(): DemoDb {
  return {
    version: 1,
    tickets: [
      {
        code: "PKF-248931",
        plate: "DEMO001",
        model: "Jeep Compass",
        color: "Preto",
        customer: "Cliente avulso",
        yard: "Patio principal",
        priceTable: "Tabela padrao",
        entryAtISO: "2026-05-13T08:20:00-03:00",
        status: "Em aberto",
      },
    ],
    payments: [],
  };
}

export function readDemoDb(): DemoDb {
  if (!isBrowser()) return defaultDb();

  const parsed = safeParseJson(localStorage.getItem(DEMO_DB_KEY));
  if (!parsed || typeof parsed !== "object") return defaultDb();

  const maybeDb = parsed as Partial<DemoDb>;
  if (maybeDb.version !== 1) return defaultDb();
  if (!Array.isArray(maybeDb.tickets) || !Array.isArray(maybeDb.payments)) return defaultDb();

  return {
    version: 1,
    tickets: maybeDb.tickets as DemoTicket[],
    payments: maybeDb.payments as DemoPayment[],
  };
}

export function writeDemoDb(db: DemoDb) {
  if (!isBrowser()) return;
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
}

export function upsertDemoTicket(ticket: DemoTicket) {
  const db = readDemoDb();
  const nextTickets = [ticket, ...db.tickets.filter((item) => item.code !== ticket.code)].slice(0, 50);
  writeDemoDb({ ...db, tickets: nextTickets });
}

export function getDemoTicket(query: string): DemoTicket | null {
  const normalized = query.trim().toUpperCase();
  if (!normalized) return null;

  const db = readDemoDb();
  return (
    db.tickets.find((ticket) => ticket.code.toUpperCase() === normalized) ??
    db.tickets.find((ticket) => ticket.plate.toUpperCase() === normalized) ??
    null
  );
}

export function listDemoTickets(): DemoTicket[] {
  return readDemoDb().tickets;
}

export function recordDemoPayment(input: Omit<DemoPayment, "id">) {
  const db = readDemoDb();
  const id = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  const payment: DemoPayment = { id, ...input };
  writeDemoDb({ ...db, payments: [payment, ...db.payments].slice(0, 200) });
}

export function formatTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDurationLabel(entryAtISO: string, exitAtISO: string): string {
  const entry = new Date(entryAtISO);
  const exit = new Date(exitAtISO);
  const deltaMs = Math.max(0, exit.getTime() - entry.getTime());

  const totalMinutes = Math.floor(deltaMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function calculateDemoAmount(entryAtISO: string, exitAtISO: string): number {
  const entry = new Date(entryAtISO);
  const exit = new Date(exitAtISO);
  const deltaMs = Math.max(0, exit.getTime() - entry.getTime());
  const durationMinutes = Math.floor(deltaMs / 60000);

  const toleranceMinutes = 15;
  if (durationMinutes <= toleranceMinutes) return 0;

  const billableBlocks = Math.ceil(durationMinutes / (60 + toleranceMinutes));
  if (billableBlocks <= 0) return 0;

  const firstHour = 12;
  const extraBlock = 6;
  return firstHour + Math.max(0, billableBlocks - 1) * extraBlock;
}
