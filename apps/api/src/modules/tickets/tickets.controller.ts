import { Controller, Get, Query } from "@nestjs/common";
import { TicketsService } from "./tickets.service";

@Controller("tickets")
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get("search")
  search(@Query() query: { ticketCode?: string; plate?: string; qrCode?: string }) {
    return this.ticketsService.search(query);
  }
}

