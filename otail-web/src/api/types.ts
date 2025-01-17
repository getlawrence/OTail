import exp from "constants";

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
    members: OrganizationMember[];
    invites: OrganizationInvite[];
}

export interface User {
    id: string;
    email: string;
    api_token: string;
    organization_id?: string;
    organizations: Organization[];
}

export interface OrganizationMember {
    user_id: string;
    email: string;
    joined_at: string;
    role: string;
}

export interface OrganizationInvite {
    email: string;
    created_at: string;
    expires_at: string;
    token: string;
    used: boolean;
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

export interface CreateInviteResponse {
    token: string;
    expiresAt: string;
}