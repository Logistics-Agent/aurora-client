type StyleLayerLike = {
  id: string;
  type: string;
  source?: string;
  "source-layer"?: string;
};

type StyleLike = {
  version: number;
  sources: Record<string, { type?: string }>;
  layers?: StyleLayerLike[];
};

export function getBuildingLayerTarget(style: StyleLike) {
  const layers = style.layers ?? [];
  const buildingLayer = layers.find(
    (layer) =>
      layer.source &&
      layer["source-layer"] === "building" &&
      style.sources[layer.source]?.type === "vector",
  );
  if (!buildingLayer?.source) return undefined;

  return {
    source: buildingLayer.source,
    sourceLayer: buildingLayer["source-layer"] ?? "building",
    beforeLayerId: layers.find((layer) => layer.type === "symbol")?.id,
  };
}

export function getMapPitch(viewportWidth: number, reducedMotion: boolean) {
  if (reducedMotion) return 0;
  if (viewportWidth < 640) return 35;
  if (viewportWidth < 1024) return 45;
  return 56;
}
