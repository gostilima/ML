"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, PlugZap, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MLStatusBadge } from "@/components/settings/ml-status-badge";
import { mlCredentialsSchema, type MLCredentialsFormValues } from "@/schemas/integrations";
import {
  useDeleteMLCredentials,
  useMLAuthorizeUrl,
  useMLCredentials,
  useSaveMLCredentials,
} from "@/hooks/use-ml-integration";
import { useToast } from "@/hooks/use-toast";
import { ApiRequestError } from "@/services/api/client";
import { formatDateTime } from "@/lib/utils";

export function MLIntegrationCard() {
  const { data: credentials, isLoading, isError, refetch } = useMLCredentials();
  const saveMutation = useSaveMLCredentials();
  const deleteMutation = useDeleteMLCredentials();
  const authorizeMutation = useMLAuthorizeUrl();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MLCredentialsFormValues>({ resolver: zodResolver(mlCredentialsSchema) });

  async function onSubmit(values: MLCredentialsFormValues) {
    try {
      await saveMutation.mutateAsync(values);
      toast({ title: "Credenciais salvas com sucesso.", variant: "success" });
      // Never keep the secret around in memory/form state longer than needed.
      reset({ client_id: "", client_secret: "" });
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Não foi possível salvar as credenciais.";
      toast({ title: "Erro ao salvar credenciais", description: message, variant: "destructive" });
    }
  }

  async function handleConnect() {
    try {
      const res = await authorizeMutation.mutateAsync();
      // Full-page redirect to Mercado Livre's OAuth consent screen. The
      // backend owns the client_id/redirect_uri/state — the frontend just
      // follows the URL it returns.
      window.location.href = res.authorize_url;
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Não foi possível iniciar a conexão com o Mercado Livre.";
      toast({ title: "Erro ao conectar", description: message, variant: "destructive" });
    }
  }

  async function handleDisconnect() {
    try {
      await deleteMutation.mutateAsync();
      toast({ title: "Integração desconectada." });
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Não foi possível desconectar.";
      toast({ title: "Erro ao desconectar", description: message, variant: "destructive" });
    } finally {
      setDeleteOpen(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !credentials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integração Mercado Livre</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Não foi possível carregar o status da integração."
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  const hasCredentials = credentials.status !== "DISCONNECTED" || !!credentials.client_id_masked;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Integração Mercado Livre</CardTitle>
            <CardDescription>
              Cadastre as credenciais da sua aplicação ML e conecte sua conta para permitir a mineração e
              monitoramento de anúncios.
            </CardDescription>
          </div>
          <MLStatusBadge status={credentials.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status summary */}
        <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/30 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Client ID</p>
            <p className="font-medium">{credentials.client_id_masked ?? "Não configurado"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Conta ML conectada</p>
            <p className="font-medium">
              {credentials.ml_nickname ?? credentials.ml_user_id ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Conectado em</p>
            <p className="font-medium">{formatDateTime(credentials.connected_at)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Token expira em</p>
            <p className="font-medium">{formatDateTime(credentials.expires_at)}</p>
          </div>
        </div>

        {credentials.status === "ERROR" && credentials.error_message && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {credentials.error_message}
          </p>
        )}

        <Separator />

        {/* Credentials form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID (App ID)</Label>
              <Input
                id="client_id"
                placeholder="Ex: 1234567890123456"
                autoComplete="off"
                {...register("client_id")}
              />
              {errors.client_id && <p className="text-sm text-destructive">{errors.client_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_secret">Client Secret</Label>
              <Input
                id="client_secret"
                type="password"
                placeholder="••••••••••••••••"
                autoComplete="off"
                {...register("client_secret")}
              />
              {errors.client_secret && (
                <p className="text-sm text-destructive">{errors.client_secret.message}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            O Client Secret é enviado apenas uma vez, diretamente ao servidor, e nunca é exibido novamente nem
            armazenado no navegador.
          </p>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar credenciais
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 pt-6">
        <p className="text-xs text-muted-foreground">
          {hasCredentials
            ? "Após salvar as credenciais, conecte sua conta do Mercado Livre para autorizar o acesso."
            : "Salve suas credenciais de aplicação ML para habilitar a conexão."}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={!hasCredentials || authorizeMutation.isPending || credentials.status === "CONNECTED"}
            variant="default"
          >
            {authorizeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlugZap className="mr-2 h-4 w-4" />
            )}
            {credentials.status === "CONNECTED" ? "Conectado" : "Conectar com Mercado Livre"}
          </Button>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={!hasCredentials}>
                <Trash2 className="mr-2 h-4 w-4" /> Desconectar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desconectar do Mercado Livre?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso removerá as credenciais salvas e revogará o acesso à sua conta ML. A mineração,
                  monitoramento e sincronização de anúncios deixarão de funcionar até que você reconecte.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Desconectar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}

export function MLIntegrationExternalLinkHint() {
  return (
    <a
      href="https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      Como obter minhas credenciais de aplicação ML <ExternalLink className="h-3 w-3" />
    </a>
  );
}
