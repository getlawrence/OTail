interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
    requiresOrg?: boolean;
}

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    }

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('api_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const message = await response.text();
            throw new ApiError(response.status, message || 'Network response was not ok');
        }
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return response.json();
        }
        return response.text() as Promise<T>;
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const {
            requiresAuth = true,
            requiresOrg = true,
            headers = {},
            ...restOptions
        } = options;

        if (requiresOrg) {
         
        }

        const requestHeaders: HeadersInit = {
            ...(requiresAuth ? this.getAuthHeaders() : {}),
            ...headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...restOptions,
            credentials: 'include',
            headers: requestHeaders,
        });

        return this.handleResponse<T>(response);
    }

    async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
