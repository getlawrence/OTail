export type Agent = {
    InstanceId: string;
    StartedAt?: string;
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
    has_connected_agent: boolean;
    members: OrganizationMember[];
    invites: OrganizationInvite[];
    tokens: OrganizationToken[];
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

export interface OrganizationToken {
    id: string;
    description: string;
    token: string;
    created_at: string;
    last_used?: string;
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

export interface LoginResponse {
    token: string;
    user: User;
    organization: Organization;
}

export interface RegisterParams {
    email: string;
    password: string;
    organization?: string;
    invite?: string;
}

export interface RegisterResponse {
    token: string;
    user: User;
    organization: Organization;
}
