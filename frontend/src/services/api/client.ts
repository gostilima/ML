import axios, { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth-storage";
import type { ApiEnvelope } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiRequestError extends Error {
  code: string;
  status?: number;
  details?: unknown;

  constructor(code: string, message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh coordination: only one refresh call in flight at a time; any
// requests that 401 while a refresh is happening wait for it.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<ApiEnvelope<{ access_token: string; refresh_token?: string }>>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken }
    );
    const body = response.data;
    if (body.success) {
      setAccessToken(body.data.access_token);
      if (body.data.refresh_token) {
        setRefreshToken(body.data.refresh_token);
      }
      return body.data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      }
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

function unwrap<T>(envelope: ApiEnvelope<T>, status?: number): T {
  if (envelope.success) {
    return envelope.data;
  }
  throw new ApiRequestError(envelope.error.code, envelope.error.message, status, envelope.error.details);
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await client.request<ApiEnvelope<T>>(config);
    return unwrap(response.data, response.status);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<ApiEnvelope<unknown>>;
      const data = axiosErr.response?.data;
      if (data && typeof data === "object" && "success" in data && data.success === false) {
        throw new ApiRequestError(
          data.error.code,
          data.error.message,
          axiosErr.response?.status,
          data.error.details
        );
      }
      throw new ApiRequestError(
        "NETWORK_ERROR",
        axiosErr.message || "Falha de comunicação com o servidor.",
        axiosErr.response?.status
      );
    }
    throw err;
  }
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: "GET", url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "POST", url, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PUT", url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PATCH", url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: "DELETE", url }),
};

export { API_BASE_URL };
