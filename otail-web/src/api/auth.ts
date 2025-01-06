import { Organization, User } from "./types";
import { apiClient } from "./client";


export const switchOrganization = async (organizationId: string) => {
    const data = await apiClient.post<{ current_organization: Organization }>(
        '/api/v1/auth/switch-organization',
        { organization_id: organizationId },
        { requiresOrg: false }
    );
    return data.current_organization;

}

export const register = async (email: string, password: string, organization: string) => {
    const data = await apiClient.post<{ user: User; api_token: string }>(
        '/api/v1/auth/register',
        {
            email,
            password,
            organization: { name: organization }
        },
        { requiresAuth: false, requiresOrg: false }
    );
    return data;
}

export const login = async (email: string, password: string) => {
    const data = await apiClient.post<{ user: User; api_token: string }>(
        '/api/v1/auth/login',
        { email, password },
        { requiresAuth: false, requiresOrg: false }
      );
    return data;
}