type MapLibreWorkerConfigurator = {
  setWorkerUrl: (workerUrl: string) => void;
};

const WORKER_FILENAME = "maplibre-gl-worker.mjs";
const SHARED_FILENAME = "maplibre-gl-shared.mjs";

export function getDocumentBaseUri(): string | undefined {
  if (typeof document !== "undefined") {
    const baseEl = document.querySelector("base");
    if (baseEl && baseEl.getAttribute("href")) {
      return document.baseURI;
    }
  }

  return process.env.NEXT_PUBLIC_BASE_PATH || undefined;
}

function resolveMapLibreAssetUrl(filename: string, baseUri?: string): string {
  let effectiveBase = baseUri;

  if (
    !effectiveBase ||
    (typeof document !== "undefined" &&
      effectiveBase === document.baseURI &&
      !document.querySelector("base"))
  ) {
    effectiveBase = getDocumentBaseUri();
  }

  if (!effectiveBase || effectiveBase === "/") {
    return `/maplibre/${filename}`;
  }

  if (/^https?:\/\//i.test(effectiveBase)) {
    const normalizedBase = effectiveBase.endsWith("/")
      ? effectiveBase
      : `${effectiveBase}/`;
    return new URL(`maplibre/${filename}`, normalizedBase).toString();
  }

  const cleanBase = effectiveBase.replace(/\/+$/, "");
  const normalizedBase = cleanBase.startsWith("/") ? cleanBase : `/${cleanBase}`;
  return `${normalizedBase}/maplibre/${filename}`;
}

export function getMapLibreWorkerUrl(baseUri?: string): string {
  return resolveMapLibreAssetUrl(WORKER_FILENAME, baseUri);
}

export function getMapLibreSharedUrl(baseUri?: string): string {
  return resolveMapLibreAssetUrl(SHARED_FILENAME, baseUri);
}

export function configureMapLibreWorker(
  maplibre: MapLibreWorkerConfigurator,
  baseUri?: string,
) {
  const resolvedBase = baseUri ?? getDocumentBaseUri();
  maplibre.setWorkerUrl(getMapLibreWorkerUrl(resolvedBase));
}


let workerConfigured = false;

export async function loadMapLibre(baseUri?: string) {
  const maplibre = await import("maplibre-gl");

  if (!workerConfigured) {
    configureMapLibreWorker(maplibre, baseUri);
    workerConfigured = true;
  }

  return maplibre;
}
