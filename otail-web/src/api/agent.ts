import { apiClient } from './client';
import type { Agent, Log } from '@/api/types';

export const agentsApi = {
  list: async (): Promise<Agent[]> => {
    const response = await apiClient.get<Record<string, Agent>>('/api/v1/agents');
    return Object.values(response.data);
  },

  getConfig: async (agentId: string): Promise<string> => {
    const response = await apiClient.get<string>(`/api/v1/agents/${agentId}/config`);
    return response.data;
  },

  updateConfig: async (agentId: string, config: string): Promise<void> => {
    const response = await apiClient.put<void>(`/api/v1/agents/${agentId}/config`, JSON.parse(config));
    return response.data;
  },

  getLogs: async (agentId: string, startTime?: Date, endTime?: Date): Promise<Log[]> => {
    const params = new URLSearchParams();
    if (startTime) {
      params.append('start_time', startTime.toISOString());
    }
    if (endTime) {
      params.append('end_time', endTime.toISOString());
    }
    const response = await apiClient.get<Log[]>(`/api/v1/agents/${agentId}/logs?${params.toString()}`);
    return response.data;
  },
};