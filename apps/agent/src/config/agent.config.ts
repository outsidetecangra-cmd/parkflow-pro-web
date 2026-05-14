import path from "path";

export type AgentConfig = {
  apiBaseUrl: string;
  unitCode: string;
  deviceName: string;
  agentKey: string;
  storageFile: string;
  heartbeatIntervalMs: number;
  syncIntervalMs: number;
};

export function loadAgentConfig(): AgentConfig {
  return {
    apiBaseUrl: process.env.AGENT_API_BASE_URL ?? "http://localhost:3001/api",
    unitCode: process.env.AGENT_UNIT_CODE ?? "ATL",
    deviceName: process.env.AGENT_DEVICE_NAME ?? "agent-atl-01",
    agentKey: process.env.AGENT_KEY ?? "troque-este-segredo",
    storageFile:
      process.env.AGENT_STORAGE_FILE ??
      path.resolve(process.cwd(), "apps", "agent", "agent-storage.json"),
    heartbeatIntervalMs: Number(process.env.AGENT_HEARTBEAT_MS ?? 15000),
    syncIntervalMs: Number(process.env.AGENT_SYNC_MS ?? 10000)
  };
}

