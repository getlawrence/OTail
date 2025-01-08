export type Agent = {
    InstanceId: string;
    status: "pending" | "processing" | "success" | "failed";
    Status: {
        health: {
            healthy: boolean;
            last_error: string;
        }
    }
    EffectiveConfig: string;
}

export type Agents = {
    [key: string]: Agent
}

export interface Organization {
    id: string;
    name: string;
    role: 'admin' | 'member';
}

export interface User {
    id: string;
    email: string;
    api_token: string;
    current_organization?: Organization;
    organizations: Organization[];
}

export type Log = {
    body: string;
    instanceId: string;
    logAttributes: string;
    resourceAttributes: any;
    serviceName: string;
    severityNumber: number
    severityText: string;
    spanId: string;
    timestamp: string;
    traceFlags: number;
    traceId: string;
}