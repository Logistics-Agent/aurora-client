import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().or(z.literal("")),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  NEXT_PUBLIC_APP_NAME:
    process.env.NEXT_PUBLIC_APP_NAME ?? "Logistics AI Control Tower",
});
