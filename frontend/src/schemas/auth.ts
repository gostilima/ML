import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo."),
    email: z.string().min(1, "Informe seu e-mail.").email("E-mail inválido."),
    company_name: z.string().optional(),
    password: z
      .string()
      .min(8, "A senha deve ter ao menos 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
      .regex(/[0-9]/, "A senha deve conter ao menos um número."),
    confirm_password: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "As senhas não coincidem.",
    path: ["confirm_password"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;
