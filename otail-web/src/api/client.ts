import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';

// RequestOptions interface removed as it's not currently used

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('api_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }
}

export const apiClient = new ApiClient();
