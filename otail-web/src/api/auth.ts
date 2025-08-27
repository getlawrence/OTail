import { apiClient } from './client';
import type { User, LoginResponse, RegisterResponse, RegisterParams } from './types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (params: RegisterParams): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/api/v1/auth/register', params);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  },
};