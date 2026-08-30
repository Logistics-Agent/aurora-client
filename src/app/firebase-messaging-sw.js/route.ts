import { env } from "@/configs";
import {
  createFirebaseServiceWorkerScript,
  createNoopServiceWorkerScript,
} from "@/features/notifications/lib/firebase-service-worker";

export const dynamic = "force-dynamic";

export function GET(): Response {
  if (!env.firebase.enabled) {
    return new Response(createNoopServiceWorkerScript(), {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const script = createFirebaseServiceWorkerScript({
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
  });

  return new Response(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
