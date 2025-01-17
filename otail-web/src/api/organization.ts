import { apiClient } from './client';
import { CreateInviteResponse, Organization } from './types';

export const organizationApi = {
  getOrganization: async (id: string): Promise<Organization> => {
    return await apiClient.get<Organization>(`/api/v1/organizations/${id}`);
  },

  createInvite: async (): Promise<CreateInviteResponse> => {
    return await apiClient.post<CreateInviteResponse>('/api/v1/organizations/invite');
  },
};
