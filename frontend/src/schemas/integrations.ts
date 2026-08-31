import { z } from "zod";

export const mlCredentialsSchema = z.object({
  client_id: z
    .string()
    .min(1, "Informe o Client ID (App ID).")
    .max(100, "Client ID muito longo."),
  client_secret: z
    .string()
    .min(1, "Informe o Client Secret.")
    .max(200, "Client Secret muito longo."),
});
export type MLCredentialsFormValues = z.infer<typeof mlCredentialsSchema>;
