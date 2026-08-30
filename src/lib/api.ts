import axios, {
    AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from "axios";

import { toApiError } from "@/lib/api-error";
import { authStorage } from "@/lib/auth-storage";
import type { ApiEnvelope } from "@/types/api.types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
const API_TIMEOUT_MS = 20_000;
const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

type HttpRequestConfig = AxiosRequestConfig & {
    skipEnvelopeUnwrap?: boolean;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

type RefreshTokenResponse = {
    accessToken: string;
};

function normalizeUrl(url: string) {
    return url.replace(/^\/+/, "");
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
    return (
        typeof value === "object" &&
        value !== null &&
        "success" in value &&
        "statusCode" in value &&
        "data" in value
    );
}

function unwrapEnvelope<T>(value: unknown): T {
    if (!isApiEnvelope<T>(value)) {
        return value as T;
    }

    if (!value.success || value.statusCode >= 400) {
        throw toApiError({
            message: value.message,
            statusCode: value.statusCode,
        });
    }

    return value.data;
}

function notifyUnauthorized() {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

export class HttpClient {
    private readonly axiosInstance: AxiosInstance;
    private readonly refreshInstance: AxiosInstance;
    private refreshPromise: Promise<string> | null = null;

    constructor(baseURL = API_BASE_URL, timeout = API_TIMEOUT_MS) {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
            timeout,
            withCredentials: true,
        });

        this.refreshInstance = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
            timeout,
            withCredentials: true,
        });

        this.registerInterceptors();
    }

    clearToken() {
        authStorage.clearAccessToken();
        delete this.axiosInstance.defaults.headers.common.Authorization;
    }

    createAbortController() {
        return new AbortController();
    }

    getToken() {
        return authStorage.getAccessToken();
    }

    setToken(token: string | null) {
        authStorage.setAccessToken(token);

        if (token) {
            this.axiosInstance.defaults.headers.common.Authorization =
                `Bearer ${token}`;
            return;
        }

        delete this.axiosInstance.defaults.headers.common.Authorization;
    }

    get<T>(url: string, config?: AxiosRequestConfig) {
        return this.request<T>({ ...config, method: "GET", url });
    }

    getEnvelope<T>(url: string, config?: AxiosRequestConfig) {
        return this.request<ApiEnvelope<T>>({
            ...config,
            method: "GET",
            skipEnvelopeUnwrap: true,
            url,
        });
    }

    post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        return this.request<T>({ ...config, data, method: "POST", url });
    }

    put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        return this.request<T>({ ...config, data, method: "PUT", url });
    }

    patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        return this.request<T>({ ...config, data, method: "PATCH", url });
    }

    delete<T>(url: string, config?: AxiosRequestConfig) {
        return this.request<T>({ ...config, method: "DELETE", url });
    }

    private refreshAccessToken() {
        if (!this.refreshPromise) {
            this.refreshPromise = this.refreshInstance
                .post<ApiEnvelope<RefreshTokenResponse> | RefreshTokenResponse>(
                    "customer/auth/refresh-token",
                )
                .then((response) => {
                    const data = unwrapEnvelope<RefreshTokenResponse>(response.data);
                    this.setToken(data.accessToken);
                    return data.accessToken;
                })
                .finally(() => {
                    this.refreshPromise = null;
                });
        }

        return this.refreshPromise;
    }

    private registerInterceptors() {
        this.axiosInstance.interceptors.request.use((config) => {
            const token = authStorage.getAccessToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        });

        this.axiosInstance.interceptors.response.use(
            (response) => {
                const config = response.config as HttpRequestConfig;

                if (config.skipEnvelopeUnwrap) {
                    return response.data;
                }

                return unwrapEnvelope(response.data);
            },
            async (error: AxiosError) => {
                const requestConfig = error.config as RetryableRequestConfig | undefined;
                const status = error.response?.status;
                const hasToken = Boolean(authStorage.getAccessToken());

                if (
                    status === 401 &&
                    requestConfig &&
                    !requestConfig._retry &&
                    hasToken
                ) {
                    requestConfig._retry = true;

                    try {
                        const token = await this.refreshAccessToken();
                        requestConfig.headers.Authorization = `Bearer ${token}`;
                        return this.axiosInstance.request(requestConfig);
                    } catch (refreshError) {
                        this.clearToken();
                        notifyUnauthorized();
                        throw toApiError(refreshError);
                    }
                }

                throw toApiError(error);
            },
        );
    }

    private request<T>(config: HttpRequestConfig) {
        return this.axiosInstance.request<unknown, T>({
            ...config,
            url: config.url ? normalizeUrl(config.url) : config.url,
        });
    }
}

export const httpClient = new HttpClient();

export const api = {
    createAbortController: () => httpClient.createAbortController(),
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        httpClient.delete<T>(url, config),
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        httpClient.get<T>(url, config),
    getEnvelope: <T>(url: string, config?: AxiosRequestConfig) =>
        httpClient.getEnvelope<T>(url, config),
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        httpClient.patch<T>(url, data, config),
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        httpClient.post<T>(url, data, config),
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        httpClient.put<T>(url, data, config),
};

export { AUTH_UNAUTHORIZED_EVENT };
