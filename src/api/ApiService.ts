// src/api/ApiService.ts
import axios, { AxiosInstance } from 'axios';
import { ApiResponse, LoginRequest, LoginResponse } from '../Interfaces/api.interface';

export class ApiService {
    private api: AxiosInstance;
    private baseURL: string;

    constructor() {
        // In development, use proxy (empty baseURL), in production use full URL
        this.baseURL = import.meta.env.DEV ? 'https://localhost:44310' : import.meta.env.VITE_API_URL //|| 'https://tradeeaseapi-fwa6aqc2dhasbpdq.canadacentral-01.azurewebsites.net');

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds timeout
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.api.interceptors.request.use(
            (config:any) => {
                const token = sessionStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error:any) => Promise.reject(error)
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response:any) => response,
            async (error:any) => {
                if (error.response?.status === 401) {
                    // Handle token refresh or logout
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');
                    sessionStorage.removeItem('accessTokenExpiry');
                    sessionStorage.removeItem('isAuthenticated');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Generic HTTP methods
    async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.api.get<ApiResponse<T>>(endpoint, { params });
            return response.data;
        } catch (error) {
            return {
                isError: true,
                message: 'Failed to fetch data',
                model: null
            };
        }
    }

    async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.api.post<ApiResponse<T>>(endpoint, data);
            return response.data;
        } catch (error) {
            return {
                isError: true,
                message: 'Failed to create data',
                model: null
            };
        }
    }

    async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.api.put<ApiResponse<T>>(endpoint, data);
            return response.data;
        } catch (error) {
            return {
                isError: true,
                message: 'Failed to update data',
                model: null
            };
        }
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await this.api.delete<ApiResponse<T>>(endpoint);
            return response.data;
        } catch (error) {
            return {
                isError: true,
                message: 'Failed to delete data',
                model: null
            };
        }
    }

    // Auth methods
    async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        debugger;
        try {
            const response = await this.api.post<ApiResponse<LoginResponse>>('/api/Users/Login', credentials);
            
            if (!response.data.isError && response.data.model) {
                const { accessToken, refreshToken, accessTokenExpiry } = response.data.model;
                sessionStorage.setItem('accessToken', accessToken);
                sessionStorage.setItem('refreshToken', refreshToken);
                sessionStorage.setItem('accessTokenExpiry', accessTokenExpiry.toString());
                sessionStorage.setItem('isAuthenticated', 'true');
                
                // Calculate expiry time
                const expiryTime = Date.now() + (accessTokenExpiry * 1000);
                sessionStorage.setItem('tokenExpiryTime', expiryTime.toString());
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                isError: true,
                message: error.response?.data?.message || 'Login failed',
                model: null
            };
        }
    }

    logout(): void {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessTokenExpiry');
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('tokenExpiryTime');
        window.location.href = '/login';
    }
}

// Create and export a singleton instance
export const apiService = new ApiService();