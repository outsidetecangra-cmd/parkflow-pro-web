export type DemoTicketStatus = "open" | "paid" | "exited" | "cancelled";
export type DemoCashMovementType = "Entrada" | "Saída";

export type DemoTicket = {
  code: string;
  plate: string;
  model: string;
  color: string;
  customer: string;
  driver: string;
  spot: string;
  yard: string;
  priceTable: string;
  entryAtISO: string;
  exitAtISO?: string;
  durationLabel?: string;
  amount: number;
  status: DemoTicketStatus;
  paymentMethod?: string;
  paidAtISO?: string;
  notes?: string;
};

export type DemoPayment = {
  id: string;
  ticketCode: string;
  plate: string;
  method: string;
  amount: number;
  atISO: string;
};

export type DemoCashMovement = {
  id: string;
  type: DemoCashMovementType;
  description: string;
  method: string;
  amount: number;
  atISO: string;
  source: "ticket" | "manual";
  ticketCode?: string;
};

export type DemoState = {
  version: 2;
  tickets: DemoTicket[];
  payments: DemoPayment[];
  cashMovements: DemoCashMovement[];
  totalSpots: number;
  reservedSpots: string[];
};

export type DemoPatioSpot = {
  spot: string;
  plate: string;
  model: string;
  customer: string;
  entryAt: string;
  duration: string;
  status: "Ocupada" | "Reservada" | "Livre";
  ticketCode?: string;
};

export type DemoDashboardTotals = {
  revenue: number;
  tickets: number;
  occupancy: number;
  exits: number;
  cancelled: number;
  activeVehicles: number;
  freeSpots: number;
  cashIn: number;
  cashOut: number;
  balance: number;
};

type LegacyDemoTicket = {
  code?: string;
  plate?: string;
  model?: string;
  color?: string;
  customer?: string;
  yard?: string;
  priceTable?: string;
  entryAtISO?: string;
  exitAtISO?: string;
  durationLabel?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  paidAtISO?: string;
};

type LegacyDemoPayment = {
  id?: string;
  ticketCode?: string;
  method?: string;
  amount?: number;
  atISO?: string;
};

export const DEMO_STORE_KEY = "smartpark_demo_store_v2";
const LEGACY_DEMO_DB_KEY = "smartpark_demo_db_v1";
const DEMO_STORE_EVENT = "smartpark-demo-store-updated";

const DEMO_SPOTS = [
  "A-01",
  "A-02",
  "A-03",
  "A-04",
  "B-01",
  "B-02",
  "B-03",
  "B-04",
  "C-01",
  "C-02",
  "C-08",
  "D-02",
];

const RESERVED_SPOTS = ["D-02"];

const demoModels = [
  { model: "Fiat Pulse", color: "Prata" },
  { model: "Honda HR-V", color: "Branco" },
  { model: "Toyota Corolla", color: "Preto" },
  { model: "Jeep Compass", color: "Cinza" },
  { model: "Chevrolet Tracker", color: "Azul" },
];

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function parseJson(value: string | null): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function todayAt(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalizePlate(plate: string) {
  return plate.trim().toUpperCase();
}

function mapLegacyStatus(status?: string): DemoTicketStatus {
  if (status === "Pago") return "paid";
  if (status === "Saída liberada") return "exited";
  if (status === "Cancelado") return "cancelled";
  return "open";
}

function normalizeTicket(ticket: Partial<DemoTicket>): DemoTicket {
  const entryAtISO = ticket.entryAtISO ?? new Date().toISOString();

  return {
    code: ticket.code || makeId("PKF"),
    plate: normalizePlate(ticket.plate || "DEMO000"),
    model: ticket.model || "Veiculo demo",
    color: ticket.color || "Prata",
    customer: ticket.customer || "Cliente avulso",
    driver: ticket.driver || ticket.customer || "Cliente avulso",
    spot: ticket.spot || "A-01",
    yard: ticket.yard || "Patio principal",
    priceTable: ticket.priceTable || "Tabela padrao",
    entryAtISO,
    exitAtISO: ticket.exitAtISO,
    durationLabel: ticket.durationLabel,
    amount: Number(ticket.amount || 0),
    status: ticket.status || "open",
    paymentMethod: ticket.paymentMethod,
    paidAtISO: ticket.paidAtISO,
    notes: ticket.notes,
  };
}

function normalizeState(candidate: Partial<DemoState>): DemoState {
  const defaultState = getDefaultDemoState();
  const tickets = Array.isArray(candidate.tickets)
    ? candidate.tickets.map((ticket) => normalizeTicket(ticket))
    : defaultState.tickets;

  const payments: DemoPayment[] = Array.isArray(candidate.payments)
    ? candidate.payments.map((payment) => ({
        id: payment.id || makeId("PAY"),
        ticketCode: payment.ticketCode || "",
        plate: payment.plate || "",
        method: payment.method || "Pix",
        amount: Number(payment.amount || 0),
        atISO: payment.atISO || new Date().toISOString(),
      }))
    : defaultState.payments;

  const cashMovements: DemoCashMovement[] = Array.isArray(candidate.cashMovements)
    ? candidate.cashMovements.map((movement) => ({
        id: movement.id || makeId("MOV"),
        type: movement.type === "Saída" ? "Saída" : "Entrada",
        description: movement.description || "Movimento demo",
        method: movement.method || "Pix",
        amount: Number(movement.amount || 0),
        atISO: movement.atISO || new Date().toISOString(),
        source: movement.source === "ticket" ? "ticket" : "manual",
        ticketCode: movement.ticketCode,
      }))
    : defaultState.cashMovements;

  return {
    version: 2,
    tickets,
    payments,
    cashMovements,
    totalSpots: Number(candidate.totalSpots || defaultState.totalSpots),
    reservedSpots: Array.isArray(candidate.reservedSpots)
      ? candidate.reservedSpots
      : defaultState.reservedSpots,
  };
}

function migrateLegacyDb(value: unknown): DemoState | null {
  if (!value || typeof value !== "object") return null;

  const legacy = value as {
    version?: number;
    tickets?: LegacyDemoTicket[];
    payments?: LegacyDemoPayment[];
  };

  if (legacy.version !== 1 || !Array.isArray(legacy.tickets)) return null;

  const tickets = legacy.tickets.map((ticket, index) =>
    normalizeTicket({
      code: ticket.code,
      plate: ticket.plate,
      model: ticket.model,
      color: ticket.color,
      customer: ticket.customer,
      driver: ticket.customer,
      spot: DEMO_SPOTS[index] || `Z-${String(index + 1).padStart(2, "0")}`,
      yard: ticket.yard,
      priceTable: ticket.priceTable,
      entryAtISO: ticket.entryAtISO,
      exitAtISO: ticket.exitAtISO,
      durationLabel: ticket.durationLabel,
      amount: ticket.amount,
      status: mapLegacyStatus(ticket.status),
      paymentMethod: ticket.paymentMethod,
      paidAtISO: ticket.paidAtISO,
    })
  );

  const payments = Array.isArray(legacy.payments)
    ? legacy.payments.map((payment) => {
        const ticket = tickets.find((item) => item.code === payment.ticketCode);

        return {
          id: payment.id || makeId("PAY"),
          ticketCode: payment.ticketCode || "",
          plate: ticket?.plate || "",
          method: payment.method || "Pix",
          amount: Number(payment.amount || 0),
          atISO: payment.atISO || new Date().toISOString(),
        };
      })
    : [];

  const cashMovements = payments.map((payment) => ({
    id: makeId("MOV"),
    type: "Entrada" as const,
    description: `Pagamento ticket ${payment.ticketCode}`,
    method: payment.method,
    amount: payment.amount,
    atISO: payment.atISO,
    source: "ticket" as const,
    ticketCode: payment.ticketCode,
  }));

  return normalizeState({
    tickets,
    payments,
    cashMovements,
    totalSpots: 12,
    reservedSpots: RESERVED_SPOTS,
  });
}

export function getDefaultDemoState(): DemoState {
  const entryOne = todayAt(8, 20);
  const entryTwo = todayAt(9, 10);
  const entryThree = todayAt(7, 45);
  const paidTwo = todayAt(10, 40);
  const paidThree = todayAt(11, 15);

  return {
    version: 2,
    totalSpots: 12,
    reservedSpots: RESERVED_SPOTS,
    tickets: [
      {
        code: "PKF-248931",
        plate: "DEMO001",
        model: "Jeep Compass",
        color: "Preto",
        customer: "Cliente avulso",
        driver: "Cliente avulso",
        spot: "A-01",
        yard: "Patio principal",
        priceTable: "Tabela padrao",
        entryAtISO: entryOne,
        amount: 0,
        status: "open",
      },
      {
        code: "PKF-309442",
        plate: "DEMO002",
        model: "Toyota Corolla",
        color: "Prata",
        customer: "Mensalista",
        driver: "Mensalista",
        spot: "A-02",
        yard: "Patio principal",
        priceTable: "Tabela padrao",
        entryAtISO: entryTwo,
        durationLabel: formatDurationLabel(entryTwo, paidTwo),
        amount: 18,
        status: "paid",
        paymentMethod: "Pix",
        paidAtISO: paidTwo,
      },
      {
        code: "PKF-418205",
        plate: "DEMO003",
        model: "Honda HR-V",
        color: "Branco",
        customer: "Cliente avulso",
        driver: "Cliente avulso",
        spot: "B-04",
        yard: "Patio principal",
        priceTable: "Tabela padrao",
        entryAtISO: entryThree,
        exitAtISO: paidThree,
        durationLabel: formatDurationLabel(entryThree, paidThree),
        amount: 24,
        status: "exited",
        paymentMethod: "Cartao de debito",
        paidAtISO: paidThree,
      },
    ],
    payments: [
      {
        id: "PAY-000001",
        ticketCode: "PKF-309442",
        plate: "DEMO002",
        method: "Pix",
        amount: 18,
        atISO: paidTwo,
      },
      {
        id: "PAY-000002",
        ticketCode: "PKF-418205",
        plate: "DEMO003",
        method: "Cartao de debito",
        amount: 24,
        atISO: paidThree,
      },
    ],
    cashMovements: [
      {
        id: "MOV-000001",
        type: "Entrada",
        description: "Pagamento ticket PKF-309442",
        method: "Pix",
        amount: 18,
        atISO: paidTwo,
        source: "ticket",
        ticketCode: "PKF-309442",
      },
      {
        id: "MOV-000002",
        type: "Entrada",
        description: "Pagamento ticket PKF-418205",
        method: "Cartao de debito",
        amount: 24,
        atISO: paidThree,
        source: "ticket",
        ticketCode: "PKF-418205",
      },
      {
        id: "MOV-000003",
        type: "Saída",
        description: "Sangria operacional",
        method: "Dinheiro",
        amount: 50,
        atISO: todayAt(9, 30),
        source: "manual",
      },
    ],
  };
}

export function getDemoState(): DemoState {
  if (!isBrowser()) return getDefaultDemoState();

  const current = parseJson(localStorage.getItem(DEMO_STORE_KEY));
  if (current && typeof current === "object") {
    const maybeState = current as Partial<DemoState>;
    if (maybeState.version === 2) return normalizeState(maybeState);
  }

  const legacy = migrateLegacyDb(parseJson(localStorage.getItem(LEGACY_DEMO_DB_KEY)));
  return legacy ?? getDefaultDemoState();
}

export function writeDemoState(nextState: DemoState): DemoState {
  const normalized = normalizeState(nextState);

  if (isBrowser()) {
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(DEMO_STORE_EVENT));
  }

  return normalized;
}

export function resetDemoStore(): DemoState {
  const state = getDefaultDemoState();
  return writeDemoState(state);
}

export function subscribeDemoStore(listener: () => void) {
  if (!isBrowser()) return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === DEMO_STORE_KEY || event.key === LEGACY_DEMO_DB_KEY) listener();
  };

  window.addEventListener(DEMO_STORE_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(DEMO_STORE_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatTimeLabel(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDurationLabel(entryAtISO: string, exitAtISO: string) {
  const entry = new Date(entryAtISO);
  const exit = new Date(exitAtISO);
  const deltaMs = Math.max(0, exit.getTime() - entry.getTime());
  const totalMinutes = Math.floor(deltaMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function calculateDemoAmount(entryAtISO: string, exitAtISO = new Date().toISOString()) {
  const entry = new Date(entryAtISO);
  const exit = new Date(exitAtISO);
  const totalMinutes = Math.max(1, Math.ceil((exit.getTime() - entry.getTime()) / 60000));
  const billableHours = Math.max(1, Math.ceil(totalMinutes / 60));

  return 12 + Math.max(0, billableHours - 1) * 6;
}

export function getDemoTicketStatusLabel(status: DemoTicketStatus) {
  const labels: Record<DemoTicketStatus, string> = {
    open: "Em aberto",
    paid: "Pago",
    exited: "Saida liberada",
    cancelled: "Cancelado",
  };

  return labels[status];
}

export function isActiveTicket(ticket: DemoTicket) {
  return ticket.status === "open" || ticket.status === "paid";
}

export function listDemoTickets(state = getDemoState()) {
  return [...state.tickets];
}

export function listActiveDemoTickets(state = getDemoState()) {
  return state.tickets.filter(isActiveTicket);
}

export function findDemoTicket(query: string, state = getDemoState()) {
  const normalized = normalizePlate(query);
  if (!normalized) return null;

  return (
    state.tickets.find((ticket) => ticket.code.toUpperCase() === normalized) ??
    state.tickets.find((ticket) => ticket.plate.toUpperCase() === normalized) ??
    null
  );
}

function pickAvailableSpot(state: DemoState, requestedSpot?: string) {
  const activeSpots = new Set(listActiveDemoTickets(state).map((ticket) => ticket.spot));
  const reservedSpots = new Set(state.reservedSpots);
  const normalizedRequestedSpot = requestedSpot?.trim();

  if (
    normalizedRequestedSpot &&
    !activeSpots.has(normalizedRequestedSpot) &&
    !reservedSpots.has(normalizedRequestedSpot)
  ) {
    return normalizedRequestedSpot;
  }

  return (
    DEMO_SPOTS.find((spot) => !activeSpots.has(spot) && !reservedSpots.has(spot)) ??
    normalizedRequestedSpot ??
    `Z-${String(activeSpots.size + 1).padStart(2, "0")}`
  );
}

export function createDemoTicket(input: {
  plate: string;
  model: string;
  color: string;
  customer: string;
  driver?: string;
  spot?: string;
  yard: string;
  priceTable: string;
  notes?: string;
}) {
  const state = getDemoState();
  const ticket: DemoTicket = {
    code: makeId("PKF"),
    plate: normalizePlate(input.plate || "DEMO000"),
    model: input.model || "Veiculo demo",
    color: input.color || "Prata",
    customer: input.customer || "Cliente avulso",
    driver: input.driver || input.customer || "Cliente avulso",
    spot: pickAvailableSpot(state, input.spot),
    yard: input.yard || "Patio principal",
    priceTable: input.priceTable || "Tabela padrao",
    entryAtISO: new Date().toISOString(),
    amount: 0,
    status: "open",
    notes: input.notes,
  };

  writeDemoState({
    ...state,
    tickets: [ticket, ...state.tickets].slice(0, 200),
  });

  return ticket;
}

export function confirmDemoPayment(ticketCode: string, method: string) {
  const state = getDemoState();
  const ticket = state.tickets.find((item) => item.code === ticketCode);
  if (!ticket) return null;

  const paidAtISO =
    ticket.paidAtISO ??
    state.payments.find((payment) => payment.ticketCode === ticket.code)?.atISO ??
    new Date().toISOString();
  const amount = ticket.amount > 0 ? ticket.amount : calculateDemoAmount(ticket.entryAtISO, paidAtISO);
  const payment =
    state.payments.find((item) => item.ticketCode === ticket.code) ?? {
      id: makeId("PAY"),
      ticketCode: ticket.code,
      plate: ticket.plate,
      method,
      amount,
      atISO: paidAtISO,
    };
  const movement =
    state.cashMovements.find((item) => item.source === "ticket" && item.ticketCode === ticket.code) ?? {
      id: makeId("MOV"),
      type: "Entrada" as const,
      description: `Pagamento ticket ${ticket.code}`,
      method,
      amount,
      atISO: paidAtISO,
      source: "ticket" as const,
      ticketCode: ticket.code,
    };
  const updatedTicket: DemoTicket = {
    ...ticket,
    status: "paid",
    amount,
    durationLabel: formatDurationLabel(ticket.entryAtISO, paidAtISO),
    paymentMethod: method,
    paidAtISO,
  };
  const nextState = writeDemoState({
    ...state,
    tickets: state.tickets.map((item) => (item.code === ticket.code ? updatedTicket : item)),
    payments: state.payments.some((item) => item.ticketCode === ticket.code)
      ? state.payments.map((item) =>
          item.ticketCode === ticket.code ? { ...item, method, amount, atISO: paidAtISO } : item
        )
      : [{ ...payment, method, amount, atISO: paidAtISO }, ...state.payments],
    cashMovements: state.cashMovements.some(
      (item) => item.source === "ticket" && item.ticketCode === ticket.code
    )
      ? state.cashMovements.map((item) =>
          item.source === "ticket" && item.ticketCode === ticket.code
            ? { ...item, method, amount, atISO: paidAtISO }
            : item
        )
      : [{ ...movement, method, amount, atISO: paidAtISO }, ...state.cashMovements],
  });

  return {
    state: nextState,
    ticket: updatedTicket,
    payment: { ...payment, method, amount, atISO: paidAtISO },
    movement: { ...movement, method, amount, atISO: paidAtISO },
  };
}

export function releaseDemoExit(ticketCode: string) {
  const state = getDemoState();
  const ticket = state.tickets.find((item) => item.code === ticketCode);
  if (!ticket) return null;

  const exitAtISO = ticket.exitAtISO ?? new Date().toISOString();
  const updatedTicket: DemoTicket = {
    ...ticket,
    status: "exited",
    exitAtISO,
    durationLabel: formatDurationLabel(ticket.entryAtISO, exitAtISO),
    amount: ticket.amount > 0 ? ticket.amount : calculateDemoAmount(ticket.entryAtISO, exitAtISO),
  };
  const nextState = writeDemoState({
    ...state,
    tickets: state.tickets.map((item) => (item.code === ticket.code ? updatedTicket : item)),
  });

  return { state: nextState, ticket: updatedTicket };
}

export function addDemoCashMovement(input: {
  type: DemoCashMovementType;
  description: string;
  method: string;
  amount: number;
}) {
  const state = getDemoState();
  const movement: DemoCashMovement = {
    id: makeId("MOV"),
    type: input.type,
    description: input.description,
    method: input.method,
    amount: input.amount,
    atISO: new Date().toISOString(),
    source: "manual",
  };
  const nextState = writeDemoState({
    ...state,
    cashMovements: [movement, ...state.cashMovements].slice(0, 300),
  });

  return { state: nextState, movement };
}

export function createDemoPatioEntry() {
  const state = getDemoState();
  const maxDemoNumber = state.tickets.reduce((max, ticket) => {
    const match = ticket.plate.match(/^DEMO(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 3);
  const nextNumber = maxDemoNumber + 1;
  const vehicle = demoModels[nextNumber % demoModels.length];

  return createDemoTicket({
    plate: `DEMO${String(nextNumber).padStart(3, "0")}`,
    model: vehicle.model,
    color: vehicle.color,
    customer: "Cliente avulso",
    driver: "Cliente avulso",
    yard: "Patio principal",
    priceTable: "Tabela padrao",
  });
}

export function getDemoPatioSpots(state = getDemoState()): DemoPatioSpot[] {
  const occupied = listActiveDemoTickets(state).map((ticket) => ({
    spot: ticket.spot,
    plate: ticket.plate,
    model: ticket.model,
    customer: ticket.customer,
    entryAt: formatTimeLabel(ticket.entryAtISO),
    duration: ticket.durationLabel || formatDurationLabel(ticket.entryAtISO, new Date().toISOString()),
    status: "Ocupada" as const,
    ticketCode: ticket.code,
  }));
  const usedSpots = new Set(occupied.map((item) => item.spot));
  const reserved = state.reservedSpots.map((spot) => ({
    spot,
    plate: "RESERVA",
    model: "Vaga mensalista",
    customer: "Contrato ativo",
    entryAt: "-",
    duration: "-",
    status: "Reservada" as const,
  }));

  reserved.forEach((item) => usedSpots.add(item.spot));

  const free = DEMO_SPOTS.filter((spot) => !usedSpots.has(spot))
    .slice(0, Math.max(0, state.totalSpots - occupied.length - reserved.length))
    .map((spot) => ({
      spot,
      plate: "-",
      model: "Disponivel",
      customer: "-",
      entryAt: "-",
      duration: "-",
      status: "Livre" as const,
    }));

  const order = new Map(DEMO_SPOTS.map((spot, index) => [spot, index]));

  return [...occupied, ...free, ...reserved].sort((left, right) => {
    return (order.get(left.spot) ?? 999) - (order.get(right.spot) ?? 999);
  });
}

export function getDemoDashboardTotals(state = getDemoState()): DemoDashboardTotals {
  const activeVehicles = listActiveDemoTickets(state).length;
  const cashIn = state.cashMovements
    .filter((movement) => movement.type === "Entrada")
    .reduce((sum, movement) => sum + movement.amount, 0);
  const cashOut = state.cashMovements
    .filter((movement) => movement.type === "Saída")
    .reduce((sum, movement) => sum + movement.amount, 0);
  const availableSpots = Math.max(0, state.totalSpots - state.reservedSpots.length);

  return {
    revenue: cashIn,
    tickets: state.tickets.length,
    occupancy: availableSpots > 0 ? Math.round((activeVehicles / availableSpots) * 100) : 0,
    exits: state.tickets.filter((ticket) => ticket.status === "exited").length,
    cancelled: state.tickets.filter((ticket) => ticket.status === "cancelled").length,
    activeVehicles,
    freeSpots: Math.max(0, availableSpots - activeVehicles),
    cashIn,
    cashOut,
    balance: cashIn - cashOut,
  };
}
