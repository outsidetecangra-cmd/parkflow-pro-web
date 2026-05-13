export type AgentEventBody = {
  eventId?: string;
  unitId?: string;
  agentId?: string;
  deviceId?: string;
  deviceType?: string;
  eventType?: string;
  occurredAt?: string;
  payload?: Record<string, unknown>;
};

export type SyncBatchBody = {
  agentId?: string;
  unitId?: string;
  batchId?: string;
  events?: Array<{
    eventId?: string;
    deviceId?: string;
    eventType?: string;
    occurredAt?: string;
    payload?: Record<string, unknown>;
  }>;
};
