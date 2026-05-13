"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentApiClient = void 0;
class AgentApiClient {
    constructor(config) {
        this.config = config;
    }
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
    async sendBatch(accessToken, agentId, unitId, events) {
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
    async sendDeviceStatus(accessToken, agentId, unitId, devices) {
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
exports.AgentApiClient = AgentApiClient;
