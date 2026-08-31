export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  company_name?: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  company_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
