import { AgentConnector, LocalQueuedEvent } from "../../types/agent.types";

export class OcrConnector implements AgentConnector {
  connectorName = "ocr";

  async emitDemoEvent(): Promise<LocalQueuedEvent> {
    return {
      eventId: `evt-ocr-${Date.now()}`,
      deviceId: "agent-device-ocr-01",
      eventType: "OCR_READ",
      occurredAt: new Date().toISOString(),
      payload: {
        plate: "DEMO001",
        rawText: "DEMO001",
        confidence: 95.1
      }
    };
  }
}

