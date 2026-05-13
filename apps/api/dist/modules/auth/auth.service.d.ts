import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { AgentLoginBody, LoginBody } from "./auth.types";
export declare class AuthService {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    private getTokenSecret;
    login(body: LoginBody): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                name: string;
                role: string | null;
                allowedUnitIds: string[];
            };
        };
    }>;
    agentLogin(body: AgentLoginBody): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            agent: {
                id: string;
                unitId: string;
                name: string;
            };
        };
    }>;
}
