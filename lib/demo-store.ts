export type DemoTicketStatus = "open" | "paid" | "exited";

export type DemoPricing = {
  firstHour: number;
  additionalHour: number;
  dailyRate: number;
  monthlyStandard: number;
  monthlyPremium: number;
  valet: number;
  carWash: number;
  lostTicket: number;
  toleranceMinutes: number;
};

export type DemoTicket = {
  id: string;
  code: string;
  plate: string;
  model: string;
  color: string;
  customer: string;
  entryAt: string;
  entryAtISO: string;
  spot: string;
  yard: string;
  priceTable: string;
  durationMinutes: number;
  durationLabel?: string;
  amount: number;
  status: DemoTicketStatus;
};

export type DemoPayment = {
  id: string;
  ticketCode: string;
  plate: string;
  method: string;
  amount: number;
  paidAt: string;
};

export type DemoCashMovement = {
  id: string;
  type: "Entrada" | "Saída";
  description: string;
  method: string;
  amount: number;
  time: string;
};

export type DemoState = {
  pricing: DemoPricing;
  tickets: DemoTicket[];
  payments: DemoPayment[];
  cashMovements: DemoCashMovement[];
};

const STORAGE_KEY = "smartpark-demo-state-v1";

export const defaultPricing: DemoPricing = {
  firstHour: 12,
  additionalHour: 6,
  dailyRate: 45,
  monthlyStandard: 220,
  monthlyPremium: 350,
  valet: 25,
  carWash: 40,
  lostTicket: 80,
  toleranceMinutes: 15,
};

function nowTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function makeId(prefix: string) {
  const number = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${number}`;
}

function makeTicketCode() {
  return makeId("PKF");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatTimeLabel(value?: string | number | Date) {
  if (!value) {
    return nowTime();
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(value);
  }

  if (typeof value === "number") {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return value;
}

export function calculateParkingAmount(
  durationMinutes: number,
  pricing: DemoPricing
) {
  if (durationMinutes <= pricing.toleranceMinutes) {
    return 0;
  }

  const billableMinutes = Math.max(
    0,
    durationMinutes - pricing.toleranceMinutes
  );

  const billableHours = Math.ceil(billableMinutes / 60);

  if (billableHours <= 1) {
    return pricing.firstHour;
  }

  const amount =
    pricing.firstHour + (billableHours - 1) * pricing.additionalHour;

  return Math.min(amount, pricing.dailyRate);
}

export const defaultDemoState: DemoState = {
  pricing: defaultPricing,
  tickets: [
    {
      id: "TCK-001",
      code: "PKF-248931",
      plate: "DEMO001",
      model: "Jeep Compass",
      color: "Preto",
      customer: "Cliente avulso",
      entryAt: "08:20",
      entryAtISO: "2026-05-15T08:20:00-03:00",
      spot: "A-01",
      yard: "Patio principal",
      priceTable: "Tabela padrao",
      durationMinutes: 215,
      amount: calculateParkingAmount(215, defaultPricing),
      status: "open",
    },
    {
      id: "TCK-002",
      code: "PKF-248932",
      plate: "DEMO002",
      model: "Toyota Corolla",
      color: "Prata",
      customer: "Mensalista",
      entryAt: "09:10",
      entryAtISO: "2026-05-15T09:10:00-03:00",
      spot: "A-02",
      yard: "Patio principal",
      priceTable: "Tabela padrao",
      durationMinutes: 165,
      amount: 0,
      status: "open",
    },
  ],
  payments: [
    {
      id: "PAY-001",
      ticketCode: "PKF-100111",
      plate: "DEMO010",
      method: "Pix",
      amount: 35,
      paidAt: "10:40",
    },
  ],
  cashMovements: [
    {
      id: "MOV-001",
      type: "Entrada",
      description: "Pagamento ticket PKF-100111",
      method: "Pix",
      amount: 35,
      time: "10:40",
    },
  ],
};

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") {
    return defaultDemoState;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDemoState));
    return defaultDemoState;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<DemoState>;

    // Migrate old tickets that may be missing new fields
    const rawTickets = parsed.tickets ?? defaultDemoState.tickets;
    const migratedTickets = rawTickets.map((t: Partial<DemoTicket> & { entryAt: string }) => ({
      ...t,
      entryAtISO: t.entryAtISO ?? new Date().toISOString(),
      spot: t.spot ?? "A-01",
      yard: t.yard ?? "Patio principal",
      priceTable: t.priceTable ?? "Tabela padrao",
      durationLabel: t.durationLabel ?? undefined,
    })) as DemoTicket[];

    return {
      ...defaultDemoState,
      ...parsed,
      pricing: {
        ...defaultPricing,
        ...(parsed.pricing ?? {}),
      },
      tickets: migratedTickets,
      payments: parsed.payments ?? defaultDemoState.payments,
      cashMovements: parsed.cashMovements ?? defaultDemoState.cashMovements,
    };
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDemoState));
    return defaultDemoState;
  }
}

export function saveDemoState(state: DemoState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("smartpark-demo-state-updated"));
}

export function getDemoState() {
  return loadDemoState();
}

export function getDefaultDemoState() {
  return defaultDemoState;
}

export function resetDemoState() {
  saveDemoState(defaultDemoState);
  return defaultDemoState;
}

export function resetDemoStore() {
  return resetDemoState();
}

export function subscribeDemoStore(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleUpdate() {
    callback();
  }

  window.addEventListener("smartpark-demo-state-updated", handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener("smartpark-demo-state-updated", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}

export function updateDemoPricing(pricing: DemoPricing) {
  const state = loadDemoState();

  const nextState: DemoState = {
    ...state,
    pricing,
  };

  saveDemoState(nextState);

  return nextState;
}

export function createDemoTicket(input: {
  plate: string;
  model: string;
  color: string;
  customer: string;
  driver?: string;
  spot?: string;
  yard?: string;
  priceTable?: string;
  notes?: string;
}) {
  const state = loadDemoState();
  const now = new Date();

  const ticket: DemoTicket = {
    id: makeId("TCK"),
    code: makeTicketCode(),
    plate: input.plate.toUpperCase(),
    model: input.model,
    color: input.color,
    customer: input.customer,
    entryAt: nowTime(),
    entryAtISO: now.toISOString(),
    spot: input.spot ?? "A-01",
    yard: input.yard ?? "Patio principal",
    priceTable: input.priceTable ?? "Tabela padrao",
    durationMinutes: 0,
    amount: 0,
    status: "open",
  };

  const nextState: DemoState = {
    ...state,
    tickets: [ticket, ...state.tickets],
  };

  saveDemoState(nextState);

  return {
    state: nextState,
    ticket,
  };
}

export function findOpenDemoTicket(search: string) {
  const state = loadDemoState();
  const term = search.trim().toUpperCase();

  return (
    state.tickets.find(
      (item) =>
        item.status === "open" &&
        (item.plate.toUpperCase() === term ||
          item.code.toUpperCase() === term)
    ) ?? state.tickets.find((item) => item.status === "open") ?? null
  );
}

export function findDemoTicket(search: string, stateOverride?: DemoState) {
  const state = stateOverride ?? loadDemoState();
  const term = search.trim().toUpperCase();

  return (
    state.tickets.find(
      (item) =>
        item.plate.toUpperCase() === term ||
        item.code.toUpperCase() === term
    ) ?? null
  );
}

export function confirmDemoPayment(searchOrInput: string | {
  search: string;
  method: string;
  amount?: number;
}, methodArg?: string) {
  const input = typeof searchOrInput === "string"
    ? { search: searchOrInput, method: methodArg ?? "Pix" }
    : searchOrInput;

  const state = loadDemoState();
  const term = input.search.trim().toUpperCase();

  const ticket =
    state.tickets.find(
      (item) =>
        item.status === "open" &&
        (item.plate.toUpperCase() === term ||
          item.code.toUpperCase() === term)
    ) ?? state.tickets.find((item) => item.status === "open");

  if (!ticket) {
    return {
      state,
      ticket: null,
      payment: null,
    };
  }

  const durationMinutes = ticket.durationMinutes || 215;

  const fallbackAmount =
    ticket.amount > 0
      ? ticket.amount
      : calculateParkingAmount(durationMinutes, state.pricing);

  const amount = input.amount ?? fallbackAmount;

  const updatedTicket: DemoTicket = {
    ...ticket,
    amount,
    durationMinutes,
    status: "paid",
  };

  const payment: DemoPayment = {
    id: makeId("PAY"),
    ticketCode: updatedTicket.code,
    plate: updatedTicket.plate,
    method: input.method,
    amount,
    paidAt: nowTime(),
  };

  const movement: DemoCashMovement = {
    id: makeId("MOV"),
    type: "Entrada",
    description: `Pagamento ticket ${updatedTicket.code}`,
    method: input.method,
    amount,
    time: payment.paidAt,
  };

  const nextState: DemoState = {
    ...state,
    tickets: state.tickets.map((item) =>
      item.id === ticket.id ? updatedTicket : item
    ),
    payments: [payment, ...state.payments],
    cashMovements: [movement, ...state.cashMovements],
  };

  saveDemoState(nextState);

  return {
    state: nextState,
    ticket: updatedTicket,
    payment,
  };
}

export function confirmDemoExit(search: string) {
  const state = loadDemoState();
  const term = search.trim().toUpperCase();

  const ticket =
    state.tickets.find(
      (item) =>
        (item.status === "paid" || item.status === "open") &&
        (item.plate.toUpperCase() === term ||
          item.code.toUpperCase() === term)
    ) ?? state.tickets.find((item) => item.status === "paid");

  if (!ticket) {
    return {
      state,
      ticket: null,
    };
  }

  const updatedTicket: DemoTicket = {
    ...ticket,
    status: "exited",
  };

  const nextState: DemoState = {
    ...state,
    tickets: state.tickets.map((item) =>
      item.id === ticket.id ? updatedTicket : item
    ),
  };

  saveDemoState(nextState);

  return {
    state: nextState,
    ticket: updatedTicket,
  };
}

export function releaseDemoExit(search: string) {
  return confirmDemoExit(search);
}

export function addDemoCashMovement(input: {
  type: "Entrada" | "Saída";
  description: string;
  method: string;
  amount: number;
}) {
  const state = loadDemoState();

  const movement: DemoCashMovement = {
    id: makeId("MOV"),
    type: input.type,
    description: input.description,
    method: input.method,
    amount: input.amount,
    time: nowTime(),
  };

  const nextState: DemoState = {
    ...state,
    cashMovements: [movement, ...state.cashMovements],
  };

  saveDemoState(nextState);

  return {
    state: nextState,
    movement,
  };
}

export function calculateDemoTotals(state: DemoState) {
  const revenue = state.payments.reduce((sum, item) => sum + item.amount, 0);

  const openTickets = state.tickets.filter(
    (item) => item.status === "open"
  ).length;

  const paidTickets = state.tickets.filter(
    (item) => item.status === "paid"
  ).length;

  const exitedTickets = state.tickets.filter(
    (item) => item.status === "exited"
  ).length;

  const cashIn = state.cashMovements
    .filter((item) => item.type === "Entrada")
    .reduce((sum, item) => sum + item.amount, 0);

  const cashOut = state.cashMovements
    .filter((item) => item.type === "Saída")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    revenue,
    openTickets,
    paidTickets,
    exitedTickets,
    totalTickets: state.tickets.length,
    cashIn,
    cashOut,
    cashBalance: cashIn - cashOut,
    occupancy: Math.min(100, Math.max(0, openTickets * 18)),
  };
}

export function getDemoDashboardTotals(state: DemoState) {
  const totals = calculateDemoTotals(state);
  return {
    revenue: totals.revenue,
    tickets: totals.totalTickets,
    exits: totals.exitedTickets,
    cancelled: 2, // demonstrativo
    balance: totals.cashBalance,
    occupancy: totals.occupancy,
    activeVehicles: totals.openTickets
  };
}

export type DemoCashMovementType = DemoCashMovement["type"];

export function calculateDemoAmount(
  ticketOrMinutes: DemoTicket | number | string,
  pricingOrIso?: DemoPricing | string
) {
  // Handle (entryAtISO: string) pattern from exit-operations-client
  if (typeof ticketOrMinutes === "string") {
    const entry = new Date(ticketOrMinutes);
    const exit = pricingOrIso && typeof pricingOrIso === "string" ? new Date(pricingOrIso) : new Date();
    const deltaMs = Math.max(0, exit.getTime() - entry.getTime());
    const durationMinutes = Math.floor(deltaMs / 60000);
    return calculateParkingAmount(durationMinutes, loadDemoState().pricing);
  }

  const pricing = (pricingOrIso && typeof pricingOrIso !== "string") ? pricingOrIso : loadDemoState().pricing;
  const durationMinutes =
    typeof ticketOrMinutes === "number"
      ? ticketOrMinutes
      : ticketOrMinutes.durationMinutes || 215;

  return calculateParkingAmount(durationMinutes, pricing);
}

export function formatDurationLabel(minutesOrIso: number | string, exitIso?: string) {
  if (typeof minutesOrIso === "string") {
    const entry = new Date(minutesOrIso);
    const exit = exitIso ? new Date(exitIso) : new Date();
    const deltaMs = Math.max(0, exit.getTime() - entry.getTime());
    const totalMinutes = Math.floor(deltaMs / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${String(m).padStart(2, "0")}m`;
  }
  return formatTimeLabel(minutesOrIso);
}

export function getDemoTicketStatusLabel(status: DemoTicketStatus) {
  const labels: Record<DemoTicketStatus, string> = {
    open: "Em aberto",
    paid: "Pago",
    exited: "Saída liberada",
  };

  return labels[status] ?? "Indefinido";
}

// --- Patio support ---

export type DemoPatioSpot = {
  spot: string;
  status: "Ocupada" | "Livre" | "Reservada";
  plate: string;
  model: string;
  customer: string;
  entryAt: string;
  duration: string;
  ticketCode: string | null;
};

const defaultSpots = [
  "A-01", "A-02", "A-03", "A-04", "A-05", "A-06",
  "B-01", "B-02", "B-03", "B-04", "B-05", "B-06",
];

export function getDemoPatioSpots(state: DemoState): DemoPatioSpot[] {
  const openTickets = state.tickets.filter((t) => t.status === "open");

  return defaultSpots.map((spot, index) => {
    const ticket = openTickets[index] ?? null;
    if (ticket) {
      const mins = ticket.durationMinutes || 0;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return {
        spot,
        status: "Ocupada" as const,
        plate: ticket.plate,
        model: ticket.model,
        customer: ticket.customer,
        entryAt: ticket.entryAt,
        duration: `${h}h ${String(m).padStart(2, "0")}m`,
        ticketCode: ticket.code,
      };
    }

    return {
      spot,
      status: "Livre" as const,
      plate: "-",
      model: "-",
      customer: "-",
      entryAt: "-",
      duration: "-",
      ticketCode: null,
    };
  });
}

export function createDemoPatioEntry() {
  const plates = ["SIM001", "SIM002", "SIM003", "SIM004", "SIM005"];
  const models = ["Fiat Argo", "VW Polo", "Chevrolet Onix", "Hyundai HB20", "Renault Kwid"];
  const colors = ["Branco", "Preto", "Prata", "Vermelho", "Azul"];
  const idx = Math.floor(Math.random() * plates.length);

  const result = createDemoTicket({
    plate: plates[idx],
    model: models[idx],
    color: colors[idx],
    customer: "Cliente avulso",
  });

  const state = getDemoState();
  const spots = getDemoPatioSpots(state);
  const freeSpot = spots.find((s) => s.status === "Livre");

  return {
    code: result.ticket.code,
    plate: result.ticket.plate,
    spot: freeSpot?.spot ?? "A-01",
  };
}

export function listDemoTickets(): DemoTicket[] {
  return loadDemoState().tickets;
}
