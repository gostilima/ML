"use client";
import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { MLIntegrationCard, MLIntegrationExternalLinkHint } from "@/components/settings/ml-integration-card";
import { ML_CREDENTIALS_KEY } from "@/hooks/use-ml-integration";
import { useToast } from "@/hooks/use-toast";

// -----------------------------------------------------------------------
// OAuth callback contract (ASSUMPTION — reconcile with the backend team)
// -----------------------------------------------------------------------
// Mercado Livre's OAuth authorize flow redirects the user's browser to a
// `redirect_uri` that must be registered with the ML application. Because
// ML calls that URL directly (it is not an XHR/fetch the frontend makes),
// and because exchanging the `code` for tokens requires the app's
// `client_secret` (which must never reach the browser), the redirect_uri
// registered with Mercado Livre MUST point at a backend endpoint
// (e.g. `${API_BASE_URL}/integrations/mercado-livre/oauth/callback`), not
// at this frontend.
//
// Once the backend finishes the token exchange, it must redirect the
// browser again — this time to a frontend URL — so the user lands back in
// the app with a visible result. This page assumes the backend redirects
// to:
//   /configuracoes?ml_connected=1                       (success)
//   /configuracoes?ml_error=<error_code_or_message>      (failure)
// If the real backend implementation uses different query param names
// (e.g. `status=success`, `code=...`), update the two `searchParams.get`
// calls below accordingly — everything else (status refetch, toast) stays
// the same.
// -----------------------------------------------------------------------
function MLOAuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const connected = searchParams.get("ml_connected");
    const error = searchParams.get("ml_error");

    if (connected) {
      handled.current = true;
      toast({ title: "Mercado Livre conectado com sucesso!", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ML_CREDENTIALS_KEY });
      router.replace("/configuracoes");
    } else if (error) {
      handled.current = true;
      toast({
        title: "Falha ao conectar com o Mercado Livre",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ML_CREDENTIALS_KEY });
      router.replace("/configuracoes");
    }
  }, [searchParams, router, queryClient, toast]);

  return null;
}

export default function ConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Suspense fallback={null}>
        <MLOAuthCallbackHandler />
      </Suspense>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua conta e as integrações da plataforma.
        </p>
      </div>

      <section className="space-y-2">
        <MLIntegrationCard />
        <MLIntegrationExternalLinkHint />
      </section>
    </div>
  );
}
