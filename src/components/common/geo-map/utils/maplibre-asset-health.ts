import { getMapLibreSharedUrl, getMapLibreWorkerUrl } from "./load-maplibre";

export interface MapLibreWorkerAssetHealth {
  worker: "ok" | "error";
  shared: "ok" | "error";
  ok: boolean;
}

const successfulAssetHealth = new Map<
  string,
  Promise<MapLibreWorkerAssetHealth>
>();

export async function checkMapLibreWorkerAssets(
  fetcher: typeof fetch = fetch,
  baseUri?: string,
): Promise<MapLibreWorkerAssetHealth> {
  const workerUrl = getMapLibreWorkerUrl(baseUri);
  const sharedUrl = getMapLibreSharedUrl(baseUri);

  const checkUrl = async (url: string): Promise<"ok" | "error"> => {
    try {
      const response = await fetcher(url, {
        method: "GET",
        cache: "no-store",
      });
      return response.ok ? "ok" : "error";
    } catch {
      return "error";
    }
  };

  const [worker, shared] = await Promise.all([
    checkUrl(workerUrl),
    checkUrl(sharedUrl),
  ]);

  return {
    worker,
    shared,
    ok: worker === "ok" && shared === "ok",
  };
}

export function getCachedMapLibreWorkerAssets(
  fetcher: typeof fetch = fetch,
  baseUri?: string,
) {
  const key = `${getMapLibreWorkerUrl(baseUri)}|${getMapLibreSharedUrl(baseUri)}`;
  const cached = successfulAssetHealth.get(key);
  if (cached) return cached;

  const result = checkMapLibreWorkerAssets(fetcher, baseUri).then((health) => {
    if (!health.ok) successfulAssetHealth.delete(key);
    return health;
  });
  successfulAssetHealth.set(key, result);
  return result;
}

export function classifyMapLibreError(
  error: unknown,
): "style-error" | "tile-error" | "worker-error" | "unknown" {
  if (!error) return "unknown";

  const errObj = error as {
    message?: string;
    status?: number;
    url?: string;
    source?: unknown;
    dataType?: string;
  };

  const message =
    typeof errObj.message === "string" ? errObj.message.toLowerCase() : "";
  const url = typeof errObj.url === "string" ? errObj.url.toLowerCase() : "";
  const dataType =
    typeof errObj.dataType === "string" ? errObj.dataType.toLowerCase() : "";

  if (
    message.includes("worker") ||
    url.includes("worker") ||
    message.includes("shared.mjs") ||
    url.includes("maplibre-gl-shared")
  ) {
    return "worker-error";
  }

  if (
    dataType === "style" ||
    message.includes("style") ||
    url.includes("/styles/") ||
    url.endsWith(".json")
  ) {
    return "style-error";
  }

  if (
    dataType === "tile" ||
    message.includes("tile") ||
    url.includes("/tiles/") ||
    url.includes("/planet/") ||
    url.endsWith(".pbf") ||
    url.endsWith(".mvt")
  ) {
    return "tile-error";
  }

  return "unknown";
}
