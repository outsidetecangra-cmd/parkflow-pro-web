import { ConfigService } from "@nestjs/config";
export declare class HealthController {
    private readonly configService;
    constructor(configService: ConfigService);
    health(): {
        success: boolean;
        data: {
            status: string;
            name: any;
        };
    };
}
