import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("health")
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  health() {
    return {
      success: true,
      data: {
        status: "ok",
        name: this.configService.get("app.name")
      }
    };
  }
}


