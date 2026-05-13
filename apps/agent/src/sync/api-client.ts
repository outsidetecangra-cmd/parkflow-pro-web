import { AgentConfig } from "../config/agent.config";
import { LocalDeviceState, LocalQueuedEvent } from "../types/agent.types";

export class AgentApiClient {
  constructor(private readonly config: AgentConfig) {}

  async authenticate() {
    const response = await fetch(`${this.config.apiBaseUrl}/auth/agent/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agentKey: this.config.agentKey,
        unitCode: this.config.unitCode,
        deviceName: this.config.deviceName
      })
    });

    return response.json();
  }

  async sendBatch(accessToken: string, agentId: string, unitId: string, events: LocalQueuedEvent[]) {
    const response = await fetch(`${this.config.apiBaseUrl}/agent/sync/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        agentId,
        unitId,
        batchId: `batch-${Date.now()}`,
        events
      })
    });

    return response.json();
  }

  async sendDeviceStatus(
    accessToken: string,
    agentId: string,
    unitId: string,
    devices: LocalDeviceState[]
  ) {
    const response = await fetch(`${this.config.apiBaseUrl}/agent/devices/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        agentId,
        unitId,
        sentAt: new Date().toISOString(),
        devices
      })
    });

    return response.json();
  }
}
