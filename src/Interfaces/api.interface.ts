// src/interfaces/api.interface.ts
export interface ApiResponse<T> {
    isError: boolean;
    message: string;
    model: T | null;
    totalCount?: number;
}

export interface LoginRequest {
    userName: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    accessTokenExpiry: number;
    refreshToken: string;
}