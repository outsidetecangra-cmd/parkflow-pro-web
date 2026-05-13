export declare const appConfig: () => {
    app: {
        name: string;
        port: number;
    };
    database: {
        url: string | undefined;
    };
    auth: {
        jwtSecret: string | undefined;
    };
};
