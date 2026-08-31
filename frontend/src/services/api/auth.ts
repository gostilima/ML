import { api } from "@/services/api/client";
import type { LoginPayload, LoginResponse, RegisterPayload, User } from "@/types/auth";

export const authApi = {
  login: (payload: LoginPayload) => api.post<LoginResponse>("/auth/login", payload),
  register: (payload: RegisterPayload) => api.post<LoginResponse>("/auth/register", payload),
  logout: () => api.post<void>("/auth/logout"),
  me: () => api.get<User>("/auth/me"),
  refresh: (refresh_token: string) =>
    api.post<{ access_token: string; refresh_token?: string }>("/auth/refresh", { refresh_token }),
};
