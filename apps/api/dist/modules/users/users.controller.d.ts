import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getContext(authorization?: string): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                name: string;
                role: string | null;
            };
            activeUnit: {
                id: string;
                name: string;
            } | null;
            operationDefaults: {
                parkingLotId: string | null;
                parkingLotName: string | null;
                priceTableId: string | null;
                priceTableName: string | null;
                cameraId: string | null;
                cameraName: string | null;
                terminalId: string | null;
                terminalName: string | null;
            };
            permissions: string[];
            allowedUnits: {
                id: string;
                name: string;
                isDefault: boolean;
            }[];
        };
    }>;
}
