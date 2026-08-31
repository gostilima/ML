export type MLConnectionStatus = "DISCONNECTED" | "CONNECTED" | "EXPIRED" | "ERROR";

export interface MLCredentials {
  status: MLConnectionStatus;
  client_id_masked: string | null;
  ml_user_id: string | null;
  ml_nickname: string | null;
  connected_at: string | null;
  expires_at: string | null;
  error_message: string | null;
}

export interface SaveMLCredentialsPayload {
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
}

export interface MLAuthorizeUrlResponse {
  authorize_url: string;
}
