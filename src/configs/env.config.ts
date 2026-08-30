import { z } from "zod";

const baseEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().or(z.literal("")),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

const firebaseEnvSchema = z
  .object({
    enabled: z.boolean(),
    apiKey: z.string(),
    authDomain: z.string(),
    projectId: z.string(),
    storageBucket: z.string(),
    messagingSenderId: z.string(),
    appId: z.string(),
    vapidKey: z.string(),
  })
  .superRefine((value, context) => {
    if (!value.enabled) return;

    for (const [field, fieldValue] of Object.entries(value)) {
      if (field !== "enabled" && !fieldValue) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: field + " is required when Firebase is enabled",
        });
      }
    }
  });

const baseEnv = baseEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  NEXT_PUBLIC_APP_NAME:
    process.env.NEXT_PUBLIC_APP_NAME ?? "Logistics AI Control Tower",
});

const firebase = firebaseEnvSchema.parse({
  enabled: process.env.NEXT_PUBLIC_FIREBASE_ENABLED === "true",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "",
});

export const env = { ...baseEnv, firebase };
