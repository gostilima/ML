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
import { registerSchema, type RegisterFormValues } from "@/schemas/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        company_name: values.company_name,
      });
      toast({ title: "Conta criada com sucesso." });
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Não foi possível criar sua conta. Tente novamente.";
      setServerError(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Comece a minerar produtos do Mercado Livre.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Empresa (opcional)</Label>
            <Input id="company_name" {...register("company_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar senha</Label>
            <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password")} />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar conta
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
