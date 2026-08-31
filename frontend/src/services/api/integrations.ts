import { api } from "@/services/api/client";
import type {
  MLAuthorizeUrlResponse,
  MLCredentials,
  SaveMLCredentialsPayload,
} from "@/types/integrations";

// All calls related to the Mercado Livre integration. The frontend never
// talks to Mercado Livre directly — every one of these hits our own
// backend, which in turn holds the ML app credentials and performs the
// OAuth dance server-side.
export const integrationsApi = {
  getMLCredentials: () => api.get<MLCredentials>("/integrations/mercado-livre/credentials"),

  saveMLCredentials: (payload: SaveMLCredentialsPayload) =>
    api.post<MLCredentials>("/integrations/mercado-livre/credentials", payload),

  deleteMLCredentials: () => api.delete<void>("/integrations/mercado-livre/credentials"),

  getMLAuthorizeUrl: () =>
    api.get<MLAuthorizeUrlResponse>("/integrations/mercado-livre/oauth/authorize-url"),
};
