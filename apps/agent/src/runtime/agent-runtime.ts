import { AgentConfig } from "../config/agent.config";
import { CameraConnector } from "../connectors/camera/camera.connector";
import { OcrConnector } from "../connectors/ocr/ocr.connector";
import { FileStorage } from "../storage/file-storage";
import { SyncManager } from "../sync/sync-manager";
import { AgentConnector, LocalDeviceState } from "../types/agent.types";

export class AgentRuntime {
  private readonly storage: FileStorage;
  private readonly sync: SyncManager;
  private readonly connectors: AgentConnector[];

  constructor(private readonly config: AgentConfig) {
    this.storage = new FileStorage(config.storageFile);
    this.sync = new SyncManager(config, this.storage);
    this.connectors = [new CameraConnector(), new OcrConnector()];
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

  private bootstrapDevices() {
    const devices: LocalDeviceState[] = [
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

  private async captureDemoEvents() {
    for (const connector of this.connectors) {
      const event = await connector.emitDemoEvent?.();
      if (event) {
        this.sync.enqueueEvent(event);
      }
    }
  }
}
