import { Body, Controller, Post } from "@nestjs/common";
import { OperationsService } from "./operations.service";
import { EntryBody, ExitCalculateBody, ExitConfirmBody } from "./operations.types";

@Controller("operations")
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post("entry")
  createEntry(@Body() body: EntryBody) {
    return this.operationsService.createEntry(body);
  }

  @Post("exit/calculate")
  calculateExit(@Body() body: ExitCalculateBody) {
    return this.operationsService.calculateExit(body);
  }

  @Post("exit/confirm")
  confirmExit(@Body() body: ExitConfirmBody) {
    return this.operationsService.confirmExit(body);
  }
}

