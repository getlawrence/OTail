import { User } from "./types";
import { apiClient } from "./client";

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