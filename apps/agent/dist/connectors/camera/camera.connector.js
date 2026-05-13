"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraConnector = void 0;
class CameraConnector {
    constructor() {
        this.connectorName = "camera";
    }
    async emitDemoEvent() {
        return {
            eventId: `evt-camera-${Date.now()}`,
            deviceId: "agent-device-camera-01",
            eventType: "LPR_CAPTURED",
            occurredAt: new Date().toISOString(),
            payload: {
                plate: "BRA2E19",
                confidence: 97.8,
                imageUrl: "local://camera/capture-demo.jpg"
            }
        };
    }
}
exports.CameraConnector = CameraConnector;
