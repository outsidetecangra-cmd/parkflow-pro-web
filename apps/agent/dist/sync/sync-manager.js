"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncManager = void 0;
const api_client_1 = require("./api-client");
class SyncManager {
    constructor(config, storage) {
        this.config = config;
        this.storage = storage;
        this.client = new api_client_1.AgentApiClient(config);
    }
    async authenticate() {
        const payload = await this.client.authenticate();
        if (!payload?.success) {
            throw new Error("Agent authentication failed");
        }
        const session = {
            accessToken: payload.data.accessToken,
            agentId: payload.data.agent.id,
            unitId: payload.data.agent.unitId,
            authenticatedAt: new Date().toISOString()
        };
        this.storage.update((state) => ({
            ...state,
            session
        }));
        return session;
    }
    enqueueEvent(event) {
        this.storage.update((state) => ({
            ...state,
            queue: [...state.queue, event]
        }));
    }
    updateDevices(devices) {
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
        const response = await this.client.sendBatch(state.session.accessToken, state.session.agentId, state.session.unitId, state.queue);
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
        return this.client.sendDeviceStatus(state.session.accessToken, state.session.agentId, state.session.unitId, state.devices);
    }
}
exports.SyncManager = SyncManager;
