import { apiClient } from './client';
import type { Organization, CreateInviteResponse } from './types';

export const organizationApi = {
  get: async (id: string): Promise<Organization> => {
    const response = await apiClient.get<Organization>(`/api/v1/organization/${id}`);
    return response.data;
  },

  createInvite: async (email: string): Promise<CreateInviteResponse> => {
    const response = await apiClient.post<CreateInviteResponse>('/api/v1/organization/invite', { email });
    return response.data;
  },

  createToken: async (orgId: string, description: string): Promise<{ token: string }> => {
    const response = await apiClient.post<{ token: string }>(`/api/v1/organization/${orgId}/token`, { description });
    return response.data;
  },
};
