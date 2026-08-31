"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationsApi } from "@/services/api/integrations";
import type { SaveMLCredentialsPayload } from "@/types/integrations";

const ML_CREDENTIALS_KEY = ["integrations", "mercado-livre", "credentials"] as const;

export function useMLCredentials() {
  return useQuery({
    queryKey: ML_CREDENTIALS_KEY,
    queryFn: () => integrationsApi.getMLCredentials(),
  });
}

export function useSaveMLCredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveMLCredentialsPayload) => integrationsApi.saveMLCredentials(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ML_CREDENTIALS_KEY });
    },
  });
}

export function useDeleteMLCredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => integrationsApi.deleteMLCredentials(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ML_CREDENTIALS_KEY });
    },
  });
}

export function useMLAuthorizeUrl() {
  return useMutation({
    mutationFn: () => integrationsApi.getMLAuthorizeUrl(),
  });
}

export { ML_CREDENTIALS_KEY };
