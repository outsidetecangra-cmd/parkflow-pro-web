import { PrismaService } from "../../prisma/prisma.service";
export declare class TicketsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    search(query: {
        ticketCode?: string;
        plate?: string;
        qrCode?: string;
    }): Promise<{
        success: boolean;
        data: {
            ticket: {
                id: string;
                code: string;
                status: import(".prisma/client").$Enums.TicketStatus;
                type: string;
                plate: string | null;
                vehicleModel: string | null;
                customerName: string | null;
                entryAt: Date;
                yardName: string | null;
                spotCode: null;
                priceTableName: string | null;
                paymentStatus: string;
                validationStatus: string;
            };
        };
    }>;
}
