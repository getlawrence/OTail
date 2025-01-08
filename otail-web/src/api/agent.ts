import { Agents, Log } from "./types";
import { apiClient } from "./client";

export async function getAgents(): Promise<Agents> {
    return apiClient.get<Agents>('/api/v1/agents');
}

export async function getConfig(agentId: string): Promise<string> {
    return apiClient.get<string>(`/api/v1/agents/${agentId}/config`);
}

export async function updateConfig(agentId: string, config: string): Promise<void> {
    return apiClient.put<void>(`/api/v1/agents/${agentId}/config`, config);
}

export async function fetchAgentLogs(agentId: string): Promise<Log[]> {
    return apiClient.get<Log[]>(`/api/v1/agents/${agentId}/logs`);
};