export type LocalAgentSession = {
  accessToken: string | null;
  agentId: string | null;
  unitId: string | null;
  authenticatedAt: string | null;
};

export type LocalQueuedEvent = {
  eventId: string;
  deviceId?: string;
  eventType: string;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export type LocalDeviceState = {
  deviceId: string;
  deviceType: string;
  status: string;
  lastSignalAt: string;
};

export type LocalStorageState = {
  session: LocalAgentSession;
  queue: LocalQueuedEvent[];
  devices: LocalDeviceState[];
};

export type AgentConnector = {
  connectorName: string;
  emitDemoEvent?: () => Promise<LocalQueuedEvent | null>;
};

