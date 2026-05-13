type TokenPayload = {
    sub: string;
    type: "user" | "agent";
    role?: string;
    unitId?: string;
    unitCode?: string;
    name?: string;
    iat: number;
    exp: number;
};
export declare function encodeToken(payload: TokenPayload, secret: string): string;
export declare function decodeToken(token: string | null | undefined, secret: string): TokenPayload | null;
export declare function getBearerToken(authorization?: string | null): string | null;
export {};
