import {
  AuditOccurrence,
  DashboardStat,
  Device,
  EventLog,
  LprCapture,
  PaymentMethod,
  RouteConfig,
  TicketView,
  UnitSummary,
  ValetRequest
} from "@/lib/types";

export const dashboardStats: DashboardStat[] = [
  { label: "Veiculos no patio", value: "184", delta: "+12 hoje", tone: "info" },
  { label: "Vagas livres", value: "316", delta: "63% disponibilidade", tone: "success" },
  { label: "Faturamento do dia", value: "R$ 28.430", delta: "+8,4%", tone: "success" },
  { label: "Tickets pendentes", value: "23", delta: "7 vencendo", tone: "warning" },
  { label: "Alertas de evasao", value: "3", delta: "2 em analise", tone: "danger" },
  { label: "Caixas abertos", value: "4", delta: "1 fechamento em 30 min", tone: "info" }
];

export const units: UnitSummary[] = [
  { id: "u1", name: "Shopping Atlante", occupancy: 72, revenue: 10340, gatesOnline: 4 },
  { id: "u2", name: "Aeroporto Norte", occupancy: 81, revenue: 12920, gatesOnline: 3 },
  { id: "u3", name: "Arena Cidade", occupancy: 54, revenue: 5170, gatesOnline: 2 }
];

export const tickets: TicketView[] = [
  {
    id: "TK-20260513-001",
    plate: "DEMO001",
    model: "Jeep Compass",
    color: "Preto",
    customer: "Marina Costa",
    driver: "Marina Costa",
    type: "Avulso",
    yard: "P1 Shopping",
    spot: "A-18",
    priceTable: "Avulso Premium",
    entryAt: "2026-05-13T09:15:00-03:00",
    exitAt: "2026-05-13T12:40:00-03:00",
    stayLabel: "3h 25m",
    amount: 32,
    discount: 4,
    finalAmount: 28,
    paymentStatus: "Aguardando pagamento",
    validationStatus: "Sem validacao",
    observations: "Veiculo sem avarias aparentes.",
    gateIn: "Entrada Norte 01",
    gateOut: "Saida Norte 02",
    cameraInImage: "/camera-entry.svg",
    cameraOutImage: "/camera-exit.svg",
    status: "Em aberto"
  },
  {
    id: "TK-20260513-002",
    plate: "SFT9K32",
    model: "Toyota Corolla",
    color: "Prata",
    customer: "Grupo Serra",
    driver: "Carlos Lima",
    type: "Convenio",
    yard: "P2 Executivo",
    spot: "B-09",
    priceTable: "Convenio Corporativo",
    entryAt: "2026-05-13T08:20:00-03:00",
    exitAt: "2026-05-13T11:55:00-03:00",
    stayLabel: "3h 35m",
    amount: 40,
    discount: 18,
    finalAmount: 22,
    paymentStatus: "Pago via Pix",
    validationStatus: "Selo Gold aplicado",
    observations: "Parceiro com 45 minutos de tolerancia.",
    gateIn: "Entrada Sul 01",
    gateOut: "Saida Sul 01",
    cameraInImage: "/camera-entry.svg",
    cameraOutImage: "/camera-exit.svg",
    status: "Pago"
  }
];

export const currentExitTicket = tickets[0];

export const paymentMethods: PaymentMethod[] = [
  { name: "Pix", total: 8240, count: 96 },
  { name: "Credito", total: 6830, count: 59 },
  { name: "Debito", total: 4920, count: 54 },
  { name: "Dinheiro", total: 2110, count: 31 },
  { name: "Sem Parar", total: 1520, count: 24 }
];

export const devices: Device[] = [
  {
    id: "eq-01",
    name: "Cancela Entrada Norte 01",
    type: "Cancela",
    unit: "Shopping Atlante",
    yard: "P1 Shopping",
    ip: "10.10.1.11",
    status: "online",
    lastSignal: "2026-05-13T12:52:00-03:00"
  },
  {
    id: "eq-02",
    name: "Camera LPR Saida Sul 01",
    type: "Camera",
    unit: "Shopping Atlante",
    yard: "P2 Executivo",
    ip: "10.10.2.40",
    status: "offline",
    lastSignal: "2026-05-13T12:17:00-03:00"
  },
  {
    id: "eq-03",
    name: "Totem Autoatendimento 01",
    type: "Totem",
    unit: "Aeroporto Norte",
    yard: "Terminal A",
    ip: "10.30.3.70",
    status: "online",
    lastSignal: "2026-05-13T12:51:00-03:00"
  }
];

export const eventLogs: EventLog[] = [
  {
    id: "ev-1",
    title: "Placa lida com sucesso",
    detail: "DEMO001 detectada na Entrada Norte 01 com confianca de 97,8%",
    level: "success",
    timestamp: "2026-05-13T12:41:00-03:00"
  },
  {
    id: "ev-2",
    title: "Falha de camera",
    detail: "Camera LPR Saida Sul 01 sem heartbeat ha 35 minutos",
    level: "danger",
    timestamp: "2026-05-13T12:17:00-03:00"
  },
  {
    id: "ev-3",
    title: "Pagamento confirmado no totem",
    detail: "Ticket TK-20260513-002 pago via Pix no Terminal 04",
    level: "info",
    timestamp: "2026-05-13T11:56:00-03:00"
  }
];

export const lprCaptures: LprCapture[] = [
  {
    id: "lpr-01",
    plate: "DEMO001",
    confidence: 97.8,
    camera: "Entrada Norte 01",
    direction: "entrada",
    timestamp: "2026-05-13T09:15:10-03:00",
    status: "validado"
  },
  {
    id: "lpr-02",
    plate: "BRA2E18",
    confidence: 78.2,
    camera: "Saida Norte 02",
    direction: "saida",
    timestamp: "2026-05-13T12:39:41-03:00",
    status: "divergente"
  }
];

export const auditOccurrences: AuditOccurrence[] = [
  {
    id: "au-01",
    type: "Placa divergente",
    severity: "alta",
    plate: "BRA2E18",
    ticket: "TK-20260513-001",
    operator: "Joana Alves",
    unit: "Shopping Atlante",
    timestamp: "2026-05-13T12:40:10-03:00",
    status: "em analise",
    comment: "Leitura de saida divergente em 1 caractere. Confirmacao manual pendente."
  },
  {
    id: "au-02",
    type: "Tentativa de evasao",
    severity: "alta",
    plate: "QTR4M11",
    ticket: "TK-20260513-015",
    operator: "Paulo Vieira",
    unit: "Arena Cidade",
    timestamp: "2026-05-13T11:12:00-03:00",
    status: "aberta",
    comment: "Sensor de laco acionado sem ticket validado."
  }
];

export const valetQueue: ValetRequest[] = [
  {
    id: "val-01",
    customer: "Ricardo Araujo",
    plate: "MOB4P21",
    status: "Em separacao",
    eta: "06 min",
    attendant: "Mateus",
    priority: "VIP"
  },
  {
    id: "val-02",
    customer: "Helena Braga",
    plate: "DEMO006",
    status: "Pronto para retirada",
    eta: "01 min",
    attendant: "Rafael",
    priority: "Normal"
  }
];

export const genericRoutes: Record<string, RouteConfig> = {
  "operacao/patio": {
    title: "Controle de Patio",
    description: "Mapa simplificado de ocupacao, alertas por permanencia e lista de veiculos presentes por patio.",
    metrics: [
      { label: "Patios monitorados", value: "5" },
      { label: "Ocupacao media", value: "68%" },
      { label: "Alertas long stay", value: "9", tone: "warning" }
    ],
    table: {
      columns: ["Patio", "Capacidade", "Ocupadas", "Reservadas", "Bloqueadas"],
      rows: [
        ["P1 Shopping", "120", "88", "4", "2"],
        ["P2 Executivo", "80", "61", "6", "1"],
        ["Arena VIP", "65", "35", "10", "5"]
      ]
    }
  },
  "operacao/consulta": {
    title: "Consulta Operacional",
    description: "Busca por ticket, placa ou QR Code com historico de permanencia, pagamentos e imagens.",
    table: {
      columns: ["Ticket", "Placa", "Cliente", "Status", "Ultima acao"],
      rows: tickets.map((ticket) => [ticket.id, ticket.plate, ticket.customer, ticket.status, ticket.paymentStatus])
    }
  },
  caixa: {
    title: "Gestao de Caixa",
    description: "Resumo por operador, recebimentos, estornos, sangrias e conciliacao de meios de pagamento.",
    metrics: [
      { label: "Caixas abertos", value: "4" },
      { label: "Previsto", value: "R$ 29.120" },
      { label: "Divergencia", value: "R$ 84", tone: "warning" }
    ],
    table: {
      columns: ["Operador", "Turno", "Recebido", "Pagamentos", "Status"],
      rows: [
        ["Joana Alves", "Manha", "R$ 7.920", "Pix / Credito", "Aberto"],
        ["Paulo Vieira", "Manha", "R$ 5.310", "Debito / Dinheiro", "Aberto"]
      ]
    }
  },
  "caixa/abertura": {
    title: "Abertura de Caixa",
    description: "Fluxo de abertura com fundo inicial, conferencias e permissao por unidade.",
    table: {
      columns: ["Caixa", "Unidade", "Operador", "Fundo", "Inicio"],
      rows: [["CX-01", "Shopping Atlante", "Joana Alves", "R$ 300", "06:00"]]
    }
  },
  "caixa/fechamento": {
    title: "Fechamento de Caixa",
    description: "Conferencia entre previsto e informado com trilha de auditoria.",
    table: {
      columns: ["Caixa", "Previsto", "Informado", "Diferenca", "Status"],
      rows: [["CX-02", "R$ 6.220", "R$ 6.220", "R$ 0,00", "Conciliado"]]
    }
  },
  pagamentos: {
    title: "Pagamentos",
    description: "Painel unificado para ticket avulso, mensalidade, selo virtual e recorrencia simulada.",
    table: {
      columns: ["Forma", "Qtde", "Total", "Conciliacao"],
      rows: paymentMethods.map((item) => [item.name, String(item.count), `R$ ${item.total}`, item.name === "Pix" ? "Conciliado" : "Pendente"])
    }
  },
  mensalistas: {
    title: "Mensalistas",
    description: "Cadastro, cobranca, inadimplencia, multiplos veiculos e bloqueio de acesso.",
    metrics: [
      { label: "Ativos", value: "10" },
      { label: "Inadimplentes", value: "2", tone: "warning" },
      { label: "Veiculos autorizados", value: "28" }
    ]
  },
  credenciados: {
    title: "Credenciados",
    description: "Regras por horario, patio, unidade e historico de uso por placa autorizada."
  },
  convenios: {
    title: "Convenios",
    description: "Descontos por parceiro, limites diarios, usuarios autorizados e historico de validacoes."
  },
  selos: {
    title: "Selos Virtuais",
    description: "Lotes, QR Codes, consumo unitario e uso por parceiro com portal dedicado."
  },
  "tabelas-preco": {
    title: "Tabelas de Preco",
    description: "Regras por faixa horaria, tolerancia, diaria, evento e simulador detalhado."
  },
  "automacao/equipamentos": {
    title: "Automacao de Equipamentos",
    description: "Status de cancelas, cameras, totens e terminais com acoes simuladas.",
    table: {
      columns: ["Equipamento", "Tipo", "Unidade", "IP", "Status"],
      rows: devices.map((device) => [device.name, device.type, device.unit, device.ip, device.status])
    }
  },
  "automacao/eventos": {
    title: "Eventos em Tempo Real",
    description: "Stream operacional de leitura de placa, pagamentos, falhas e liberacoes de saida."
  },
  "ocr/capturas": {
    title: "Capturas OCR / LPR",
    description: "Lista de leituras com confianca, sentido, camera e ticket relacionado."
  },
  "auditoria/ocorrencias": {
    title: "Auditoria Eletronica",
    description: "Ocorrencias por evasao, divergencia de placa, passagem nao autorizada e reutilizacao de ticket."
  },
  totem: {
    title: "Totem de Autoatendimento",
    description: "Modo kiosk para pagamento touch-friendly, mensalidade, selo virtual e banners comerciais."
  },
  "app-cliente": {
    title: "App Cliente",
    description: "Carteira digital, pagamento mobile, historico, contratacao de vaga e compartilhamento."
  },
  "mobile-operador": {
    title: "Mobile Operador",
    description: "Entrada e saida rapidas, cobranca em campo, LPR simulado e operacao offline-first."
  },
  "valet/fila": {
    title: "Fila de Valet",
    description: "Board de retirada com ETA, prioridade, manobrista responsavel e SLA de entrega."
  },
  "erp/financeiro": {
    title: "ERP Financeiro",
    description: "Recebiveis, contas a pagar, recorrencias, fechamentos e indicadores financeiros."
  },
  "erp/estoque": {
    title: "ERP Estoque",
    description: "Bobinas, cartoes, pecas, materiais e niveis minimos por unidade."
  },
  "erp/sinistros": {
    title: "ERP Sinistros",
    description: "Avarias, reclamacoes, evidencias fotograficas e fluxo de resolucao."
  },
  "fiscal/rps": {
    title: "Fiscal RPS",
    description: "Emissao, fila de envio, status por municipio e reenvio manual."
  },
  "fiscal/nfse": {
    title: "Fiscal NFSe",
    description: "Conversao simulada, XML/PDF, cancelamento e acompanhamento de autorizacao."
  },
  relatorios: {
    title: "Relatorios",
    description: "Exportacoes simuladas em CSV/PDF por movimento, faturamento, ocupacao, evasao e fiscal."
  },
  "admin/usuarios": {
    title: "Administracao de Usuarios",
    description: "Perfis, RBAC, segregacao por unidade e logs de acoes criticas."
  },
  "admin/unidades": {
    title: "Administracao de Unidades",
    description: "Gestao de unidades, patios, vagas, equipamentos e parametros operacionais."
  },
  "admin/configuracoes": {
    title: "Configuracoes Gerais",
    description: "Dados fiscais, layouts, integracoes simuladas e parametros de seguranca."
  }
};

export const routeLabels = Object.keys(genericRoutes);


