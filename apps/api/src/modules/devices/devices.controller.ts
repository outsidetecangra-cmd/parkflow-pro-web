import { Body, Controller, Post } from "@nestjs/common";
import { DevicesService } from "./devices.service";
import { DeviceStatusBody } from "./devices.types";

@Controller("agent/devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post("status")
  updateStatus(@Body() body: DeviceStatusBody) {
    return this.devicesService.updateStatus(body);
  }
}
