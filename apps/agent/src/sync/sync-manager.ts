import { AgentApiClient } from "./api-client";
import { FileStorage } from "../storage/file-storage";
import { AgentConfig } from "../config/agent.config";
import { LocalDeviceState, LocalQueuedEvent } from "../types/agent.types";

export class SyncManager {
  private readonly client: AgentApiClient;

  constructor(
    private readonly config: AgentConfig,
    private readonly storage: FileStorage
  ) {
    this.client = new AgentApiClient(config);
  }

  async authenticate() {
    const payload = await this.client.authenticate();

    if (!payload?.success) {
      throw new Error("Agent authentication failed");
    }

    const session = {
      accessToken: payload.data.accessToken as string,
      agentId: payload.data.agent.id as string,
      unitId: payload.data.agent.unitId as string,
      authenticatedAt: new Date().toISOString()
    };

    this.storage.update((state) => ({
      ...state,
      session
    }));

    return session;
  }

  enqueueEvent(event: LocalQueuedEvent) {
    this.storage.update((state) => ({
      ...state,
      queue: [...state.queue, event]
    }));
  }

  updateDevices(devices: LocalDeviceState[]) {
    this.storage.update((state) => ({
      ...state,
      devices
    }));
  }

  async flushQueue() {
    const state = this.storage.read();
    if (!state.session.accessToken || !state.session.agentId || !state.session.unitId || state.queue.length === 0) {
      return { flushed: 0 };
    }

    const response = await this.client.sendBatch(
      state.session.accessToken,
      state.session.agentId,
      state.session.unitId,
      state.queue
    );

    if (response?.success) {
      this.storage.update((current) => ({
        ...current,
        queue: []
      }));
      return { flushed: state.queue.length };
    }

    return { flushed: 0 };
  }

  async sendHeartbeat() {
    const state = this.storage.read();
    if (!state.session.accessToken || !state.session.agentId || !state.session.unitId) {
      return { received: 0 };
    }

    return this.client.sendDeviceStatus(
      state.session.accessToken,
      state.session.agentId,
      state.session.unitId,
      state.devices
    );
  }
}
