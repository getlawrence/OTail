import { apiClient } from './client';
import { LoginResponse, RegisterParams, RegisterResponse, User } from './types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return await apiClient.post<LoginResponse>('/api/v1/auth/login', {
      email,
      password,
    });
  },

  register: async (params: RegisterParams): Promise<RegisterResponse> => {
    return await apiClient.post<RegisterResponse>('/api/v1/auth/register', params);
  },

  me: async (): Promise<User> => {
    return await apiClient.get<User>('/api/v1/auth/me');
  },
};