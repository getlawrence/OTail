import { Agents } from "./types";
import { apiClient } from "./client";

const checkOrganization = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    const user = JSON.parse(userData);
    if (!user.current_organization) {
        throw new Error('Please select an organization first');
    }
};

export async function getAgents(): Promise<Agents> {
    checkOrganization();
    return apiClient.get<Agents>('/api/v1/agents');
}

export async function getConfig(agentId: string): Promise<string> {
    checkOrganization();
    return apiClient.get<string>(`/api/v1/agents/${agentId}/config`);
}

export async function updateConfig(agentId: string, config: string): Promise<void> {
    checkOrganization();
    return apiClient.put<void>(`/api/v1/agents/${agentId}/config`, config);
}

export async function fetchAgentLogs(agentId: string): Promise<string> {
    checkOrganization();
    return apiClient.get<string>(`/api/v1/agents/${agentId}/logs`);
};