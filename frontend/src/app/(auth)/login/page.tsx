"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/services/api/client";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values);
      toast({ title: "Login realizado com sucesso." });
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Não foi possível entrar. Tente novamente.";
      setServerError(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
