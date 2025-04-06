import { AgentGroup, AgentGroupFormData } from '@/types/deployment';
import { apiClient } from './client';

export const agentGroupsApi = {
  list: async (deploymentId?: string): Promise<AgentGroup[]> => {
    const response = await apiClient.get<AgentGroup[]>(`/api/v1/agent-groups?deployment_id=${deploymentId}`);
    return response.data;
  },

  get: async (id: string): Promise<AgentGroup> => {
    const response = await apiClient.get<AgentGroup>(`/api/v1/agent-groups/${id}`);
    return response.data;
  },

  create: async (data: AgentGroupFormData): Promise<AgentGroup> => {
    const response = await apiClient.post<AgentGroup>('/api/v1/agent-groups', data);
    return response.data;
  },

  update: async (id: string, data: AgentGroupFormData): Promise<AgentGroup> => {
    const response = await apiClient.put<AgentGroup>(`/api/v1/agent-groups/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/agent-groups/${id}`);
  },

  addAgent: async (groupId: string, agentId: string): Promise<void> => {
    await apiClient.post(`/api/v1/agent-groups/${groupId}/agents/${agentId}`);
  },

  removeAgent: async (groupId: string, agentId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/agent-groups/${groupId}/agents/${agentId}`);
  },
}; 