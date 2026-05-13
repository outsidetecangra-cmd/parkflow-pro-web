"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntime = void 0;
const camera_connector_1 = require("../connectors/camera/camera.connector");
const ocr_connector_1 = require("../connectors/ocr/ocr.connector");
const file_storage_1 = require("../storage/file-storage");
const sync_manager_1 = require("../sync/sync-manager");
class AgentRuntime {
    constructor(config) {
        this.config = config;
        this.storage = new file_storage_1.FileStorage(config.storageFile);
        this.sync = new sync_manager_1.SyncManager(config, this.storage);
        this.connectors = [new camera_connector_1.CameraConnector(), new ocr_connector_1.OcrConnector()];
    }
    async start() {
        await this.sync.authenticate();
        this.bootstrapDevices();
        await this.captureDemoEvents();
        await this.sync.flushQueue();
        await this.sync.sendHeartbeat();
        setInterval(() => {
            void this.sync.flushQueue();
        }, this.config.syncIntervalMs);
        setInterval(() => {
            void this.sync.sendHeartbeat();
        }, this.config.heartbeatIntervalMs);
        console.log("[agent] running", {
            unitCode: this.config.unitCode,
            deviceName: this.config.deviceName
        });
    }
    bootstrapDevices() {
        const devices = [
            {
                deviceId: "agent-device-camera-01",
                deviceType: "CAMERA",
                status: "online",
                lastSignalAt: new Date().toISOString()
            },
            {
                deviceId: "agent-device-ocr-01",
                deviceType: "OCR",
                status: "online",
                lastSignalAt: new Date().toISOString()
            }
        ];
        this.sync.updateDevices(devices);
    }
    async captureDemoEvents() {
        for (const connector of this.connectors) {
            const event = await connector.emitDemoEvent?.();
            if (event) {
                this.sync.enqueueEvent(event);
            }
        }
    }
}
exports.AgentRuntime = AgentRuntime;
