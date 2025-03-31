import { apiClient } from './client';
import type {
  Deployment,
  CreateDeploymentRequest,
  UpdateDeploymentRequest,
} from '@/types/deployment';

export const deploymentsApi = {
  list: async (): Promise<Deployment[]> => {
    const response = await apiClient.get<Deployment[]>('/api/v1/deployments');
    return response.data;
  },

  get: async (id: string): Promise<Deployment> => {
    const response = await apiClient.get<Deployment>(`/api/v1/deployments/${id}`);
    return response.data;
  },

  create: async (data: CreateDeploymentRequest): Promise<Deployment> => {
    const response = await apiClient.post<Deployment>('/api/v1/deployments', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDeploymentRequest): Promise<Deployment> => {
    const response = await apiClient.put<Deployment>(`/api/v1/deployments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete<void>(`/api/v1/deployments/${id}`);
    return response.data;
  },

  addGroup: async (deploymentId: string, groupId: string): Promise<void> => {
    await apiClient.post(`/api/v1/deployments/${deploymentId}/groups/${groupId}`);
  },

  removeGroup: async (deploymentId: string, groupId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/deployments/${deploymentId}/groups/${groupId}`);
  },
}; 