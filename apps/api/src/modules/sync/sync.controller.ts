import { Body, Controller, Post } from "@nestjs/common";
import { SyncService } from "./sync.service";
import { AgentEventBody, SyncBatchBody } from "./sync.types";

@Controller("agent")
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post("events")
  publishEvent(@Body() body: AgentEventBody) {
    return this.syncService.publishEvent(body);
  }

  @Post("sync/batch")
  syncBatch(@Body() body: SyncBatchBody) {
    return this.syncService.syncBatch(body);
  }
}

