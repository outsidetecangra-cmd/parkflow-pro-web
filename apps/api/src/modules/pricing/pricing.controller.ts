import { Body, Controller, Get, Put } from "@nestjs/common";
import { PricingService } from "./pricing.service";

@Controller("pricing")
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  async getPricingConfig() {
    return this.pricingService.getPricingConfig();
  }

  @Put()
  async updatePricingConfig(
    @Body()
    body: {
      firstHour: number;
      additionalFraction: number;
      graceMinutes: number;
      maxDaily: number | null;
    }
  ) {
    return this.pricingService.updatePricingConfig(body);
  }
}
