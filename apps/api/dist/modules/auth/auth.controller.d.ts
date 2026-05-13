import { AuthService } from "./auth.service";
import { AgentLoginBody, LoginBody } from "./auth.types";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
