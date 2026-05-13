import { PrismaService } from "../../prisma/prisma.service";
import { EntryBody, ExitCalculateBody, ExitConfirmBody } from "./operations.types";
export declare class OperationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private generateTicketCode;
    private generateQrCode;
    private computePricing;
    createEntry(body: EntryBody): Promise<{
        success: boolean;
        data: {
            ticket: {
                id: string;
                code: string;
                status: import(".prisma/client").$Enums.TicketStatus;
                entryAt: Date;
                qrCode: string | null;
            };
            gateAction: {
                allowed: boolean;
                reason: null;
            };
        };
    }>;
    calculateExit(body: ExitCalculateBody): Promise<{
        success: boolean;
        data: {
            ticket: {
                code: string;
                status: import(".prisma/client").$Enums.TicketStatus;
                stayMinutes: number;
            };
            pricing: {
                stayMinutes: number;
                originalAmount: number;
                discountAmount: number;
                extraAmount: number;
                finalAmount: number;
                appliedRules: string[];
            };
            alerts: {
                code: string;
                message: string;
            }[];
        };
    }>;
    confirmExit(body: ExitConfirmBody): Promise<{
        success: boolean;
        data: {
            ticket: {
                code: string;
                status: import(".prisma/client").$Enums.TicketStatus;
                finalAmount: number;
            };
            gateAction: {
                allowed: boolean;
                command: string;
            };
            audit: {
                occurrenceCreated: boolean;
                reason: string | null;
            };
        };
    }>;
}
