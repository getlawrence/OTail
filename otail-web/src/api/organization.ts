import { apiClient } from './client';
import { CreateInviteResponse, Organization } from './types';

export const organizationApi = {
  getOrganization: async (id: string): Promise<Organization> => {
    return await apiClient.get<Organization>(`/api/v1/organization/${id}`);
  },

  createInvite: async (email: string): Promise<CreateInviteResponse> => {
    return await apiClient.post<CreateInviteResponse>('/api/v1/organization/invite', { email });
  },

  createToken: async (orgId: string, description: string): Promise<{token: string}> => {
    return await apiClient.post<{token: string}>(`/api/v1/organization/${orgId}/token`, { description });
  },
};
