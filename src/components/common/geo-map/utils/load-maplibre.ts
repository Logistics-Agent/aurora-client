type MapLibreWorkerConfigurator = {
  setWorkerUrl: (workerUrl: string) => void;
};

const MAPLIBRE_WORKER_URL = "/maplibre/maplibre-gl-worker.mjs";

export function configureMapLibreWorker(
  maplibre: MapLibreWorkerConfigurator,
) {
  maplibre.setWorkerUrl(MAPLIBRE_WORKER_URL);
}

let workerConfigured = false;

export async function loadMapLibre() {
  const maplibre = await import("maplibre-gl");

  if (!workerConfigured) {
    configureMapLibreWorker(maplibre);
    workerConfigured = true;
  }

  return maplibre;
}
