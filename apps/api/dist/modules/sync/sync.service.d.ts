import { PrismaService } from "../../prisma/prisma.service";
import { AgentEventBody, SyncBatchBody } from "./sync.types";
export declare class SyncService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    publishEvent(body: AgentEventBody): Promise<{
        success: boolean;
        data: {
            accepted: boolean;
            eventId: string;
            duplicated: boolean;
        };
    } | {
        success: boolean;
        data: {
            accepted: boolean;
            eventId: string;
            duplicated?: undefined;
        };
    }>;
    syncBatch(body: SyncBatchBody): Promise<{
        success: boolean;
        data: {
            batchId: string;
            processed: number;
            failed: number;
            results: {
                eventId: string;
                status: string;
            }[];
            duplicated: boolean;
        };
    } | {
        success: boolean;
        data: {
            batchId: string;
            processed: number;
            failed: number;
            results: {
                eventId: string;
                status: string;
            }[];
            duplicated?: undefined;
        };
    }>;
}
