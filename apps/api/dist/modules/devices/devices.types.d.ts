export type DeviceStatusBody = {
    agentId?: string;
    unitId?: string;
    sentAt?: string;
    devices?: Array<{
        deviceId?: string;
        deviceType?: string;
        status?: string;
        lastSignalAt?: string;
    }>;
};
