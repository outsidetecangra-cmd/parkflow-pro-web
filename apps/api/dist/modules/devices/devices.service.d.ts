import { PrismaService } from "../../prisma/prisma.service";
import { DeviceStatusBody } from "./devices.types";
export declare class DevicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    updateStatus(body: DeviceStatusBody): Promise<{
        success: boolean;
        data: {
            received: number;
        };
    }>;
}
