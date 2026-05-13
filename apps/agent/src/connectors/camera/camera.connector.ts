import { AgentConnector, LocalQueuedEvent } from "../../types/agent.types";

export class CameraConnector implements AgentConnector {
  connectorName = "camera";

  async emitDemoEvent(): Promise<LocalQueuedEvent> {
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
