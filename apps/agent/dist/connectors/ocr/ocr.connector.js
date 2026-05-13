"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrConnector = void 0;
class OcrConnector {
    constructor() {
        this.connectorName = "ocr";
    }
    async emitDemoEvent() {
        return {
            eventId: `evt-ocr-${Date.now()}`,
            deviceId: "agent-device-ocr-01",
            eventType: "OCR_READ",
            occurredAt: new Date().toISOString(),
            payload: {
                plate: "BRA2E19",
                rawText: "BRA2E19",
                confidence: 95.1
            }
        };
    }
}
exports.OcrConnector = OcrConnector;
