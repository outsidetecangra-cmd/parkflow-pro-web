export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export type DashboardStat = {
  label: string;
  value: string;
  delta?: string;
  tone?: StatusTone;
};

export type VehicleType =
  | "Avulso"
  | "Mensalista"
  | "Credenciado"
  | "Convenio"
  | "Evento"
  | "Valet"
  | "Lava-rapido";

export type TicketStatus =
  | "Em aberto"
  | "Pago"
  | "Validado"
  | "Em saida"
  | "Finalizado"
  | "Cancelado"
  | "Evasao"
  | "Isento";

export type UnitSummary = {
  id: string;
  name: string;
  occupancy: number;
  revenue: number;
  gatesOnline: number;
};

export type TicketView = {
  id: string;
  plate: string;
  model: string;
  color: string;
  customer: string;
  driver: string;
  type: VehicleType;
  yard: string;
  spot: string;
  priceTable: string;
  entryAt: string;
  exitAt?: string;
  stayLabel: string;
  amount: number;
  discount: number;
  finalAmount: number;
  paymentStatus: string;
  validationStatus: string;
  observations: string;
  gateIn: string;
  gateOut?: string;
  cameraInImage: string;
  cameraOutImage?: string;
  status: TicketStatus;
};

export type PaymentMethod = {
  name: string;
  total: number;
  count: number;
};

export type Device = {
  id: string;
  name: string;
  type: string;
  unit: string;
  yard: string;
  ip: string;
  status: "online" | "offline";
  lastSignal: string;
};

export type EventLog = {
  id: string;
  title: string;
  detail: string;
  level: StatusTone;
  timestamp: string;
};

export type LprCapture = {
  id: string;
  plate: string;
  confidence: number;
  camera: string;
  direction: "entrada" | "saida";
  timestamp: string;
  status: "validado" | "divergente" | "nao identificado" | "suspeito";
};

export type AuditOccurrence = {
  id: string;
  type: string;
  severity: "alta" | "media" | "baixa";
  plate: string;
  ticket: string;
  operator: string;
  unit: string;
  timestamp: string;
  status: "aberta" | "em analise" | "resolvida" | "descartada";
  comment: string;
};

export type ValetRequest = {
  id: string;
  customer: string;
  plate: string;
  status: string;
  eta: string;
  attendant: string;
  priority: string;
};

export type RouteConfig = {
  title: string;
  description: string;
  metrics?: DashboardStat[];
  table?: {
    columns: string[];
    rows: string[][];
  };
};
