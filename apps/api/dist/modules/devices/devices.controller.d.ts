import { DevicesService } from "./devices.service";
import { DeviceStatusBody } from "./devices.types";
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    updateStatus(body: DeviceStatusBody): Promise<{
        success: boolean;
        data: {
            received: number;
        };
    }>;
}
