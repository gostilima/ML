"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api/auth";
import { ApiRequestError } from "@/services/api/client";
import { clearAuth, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "@/lib/auth-storage";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function bootstrap() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }
      try {
        // No access token yet in this tab (fresh reload) — exchange the
        // persisted refresh token for a new access token before fetching
        // the current user.
        if (!getAccessToken()) {
          const tokens = await authApi.refresh(refreshToken);
          setAccessToken(tokens.access_token);
          if (tokens.refresh_token) setRefreshToken(tokens.refresh_token);
        }
        const me = await authApi.me();
        setUser(me);
      } catch {
        clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  const login = React.useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    setAccessToken(res.access_token);
    setRefreshToken(res.refresh_token);
    setUser(res.user);
  }, []);

  const register = React.useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    setAccessToken(res.access_token);
    setRefreshToken(res.refresh_token);
    setUser(res.user);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // best-effort — still clear local session even if the call fails
      if (!(err instanceof ApiRequestError)) {
        console.warn("Falha ao encerrar sessão no servidor.");
      }
    } finally {
      clearAuth();
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
