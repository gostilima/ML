import { api, ApiRequestError } from "@/services/api/client";
import type {
  MLAuthorizeUrlResponse,
  MLCredentials,
  SaveMLCredentialsPayload,
} from "@/types/integrations";

const NOT_CONFIGURED: MLCredentials = {
  status: "DISCONNECTED",
  client_id_masked: null,
  ml_user_id: null,
  ml_nickname: null,
  connected_at: null,
  expires_at: null,
  error_message: null,
};

// All calls related to the Mercado Livre integration. The frontend never
// talks to Mercado Livre directly — every one of these hits our own
// backend, which in turn holds the ML app credentials and performs the
// OAuth dance server-side.
export const integrationsApi = {
  getMLCredentials: async (): Promise<MLCredentials> => {
    try {
      return await api.get<MLCredentials>("/integrations/mercado-livre/credentials");
    } catch (err) {
      // 404 here just means the org hasn't configured ML credentials yet --
      // that's a normal, expected state, not a failure to report.
      if (err instanceof ApiRequestError && err.status === 404) {
        return NOT_CONFIGURED;
      }
      throw err;
    }
  },

  saveMLCredentials: (payload: SaveMLCredentialsPayload) =>
    api.post<MLCredentials>("/integrations/mercado-livre/credentials", payload),

  deleteMLCredentials: () => api.delete<void>("/integrations/mercado-livre/credentials"),

  getMLAuthorizeUrl: () =>
    api.get<MLAuthorizeUrlResponse>("/integrations/mercado-livre/oauth/authorize-url"),
};
