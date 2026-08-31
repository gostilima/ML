// Token storage strategy
// -----------------------------------------------------------------------
// The task spec allows either an httpOnly cookie (set by the backend) or a
// simple client-side auth store, "document choice". Since this frontend has
// no visibility into how the backend issues/sets cookies yet, and the spec
// explicitly says the backend returns a JWT access token to be sent via an
// `Authorization: Bearer` header (not a cookie the browser attaches
// automatically), we use a small client-side token store:
//   - access token: kept in memory (module-level variable) for the life of
//     the tab, so it is never persisted to disk.
//   - refresh token: persisted in localStorage so the session survives a
//     page reload without forcing a re-login; it is only ever sent to
//     POST /auth/refresh.
// If/when the backend instead sets httpOnly cookies for both tokens, this
// module can be gutted and replaced with credentials: "include" requests —
// no other part of the app depends on the storage mechanism, all reads go
// through the functions below.
// -----------------------------------------------------------------------

const REFRESH_TOKEN_KEY = "mi_refresh_token";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export function clearAuth(): void {
  setAccessToken(null);
  setRefreshToken(null);
}
