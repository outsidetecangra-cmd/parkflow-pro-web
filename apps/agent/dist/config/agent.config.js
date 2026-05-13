"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAgentConfig = loadAgentConfig;
const path_1 = __importDefault(require("path"));
function loadAgentConfig() {
    return {
        apiBaseUrl: process.env.AGENT_API_BASE_URL ?? "http://localhost:3001/api",
        unitCode: process.env.AGENT_UNIT_CODE ?? "ATL",
        deviceName: process.env.AGENT_DEVICE_NAME ?? "agent-atl-01",
        agentKey: process.env.AGENT_KEY ?? "agent-secret",
        storageFile: process.env.AGENT_STORAGE_FILE ??
            path_1.default.resolve(process.cwd(), "apps", "agent", "agent-storage.json"),
        heartbeatIntervalMs: Number(process.env.AGENT_HEARTBEAT_MS ?? 15000),
        syncIntervalMs: Number(process.env.AGENT_SYNC_MS ?? 10000)
    };
}
