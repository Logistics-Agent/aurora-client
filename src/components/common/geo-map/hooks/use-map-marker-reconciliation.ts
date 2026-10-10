import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { LogisticsGeoMarker } from "../types";
import { getDomMarkerIds } from "../utils/geojson";
import {
  createShipmentMapMarker,
  updateShipmentMapMarker,
} from "../utils/shipment-map-marker";
import type { loadMapLibre } from "../utils/load-maplibre";

type MapLibreModule = Awaited<ReturnType<typeof loadMapLibre>>;
type MapLibreMarker = InstanceType<MapLibreModule["Marker"]>;

type UseMapMarkerReconciliationOptions = {
  mapRef: React.MutableRefObject<MapLibreMap | null>;
  mapLibreModuleRef: React.MutableRefObject<MapLibreModule | null>;
  mapReady: boolean;
  markers: LogisticsGeoMarker[];
  selectedMarkerId?: string;
  onMarkerSelect?: (markerId: string) => void;
};

function removeMarkers(markerRefs: Map<string, MapLibreMarker>) {
  markerRefs.forEach((marker) => marker.remove());
  markerRefs.clear();
}

export function useMapMarkerReconciliation({
  mapRef,
  mapLibreModuleRef,
  mapReady,
  markers,
  selectedMarkerId,
  onMarkerSelect,
}: UseMapMarkerReconciliationOptions) {
  const markerRefs = useRef(new Map<string, MapLibreMarker>());
  const onMarkerSelectRef = useRef(onMarkerSelect);

  useEffect(() => {
    onMarkerSelectRef.current = onMarkerSelect;
  }, [onMarkerSelect]);

  useEffect(() => {
    if (!mapReady) {
      removeMarkers(markerRefs.current);
      return;
    }

    const map = mapRef.current;
    const maplibre = mapLibreModuleRef.current;
    if (!map || !maplibre) return;

    const domMarkerIds = getDomMarkerIds(markers, selectedMarkerId);
    const visibleMarkerIds = new Set<string>();

    markers.forEach((marker) => {
      if (!domMarkerIds.has(marker.id)) return;
      visibleMarkerIds.add(marker.id);

      const existingMarker = markerRefs.current.get(marker.id);
      if (existingMarker) {
        existingMarker.setLngLat([
          marker.position.longitude,
          marker.position.latitude,
        ]);
        updateShipmentMapMarker(existingMarker.getElement(), marker);
        return;
      }

      const element = createShipmentMapMarker(
        marker,
        (markerId) => onMarkerSelectRef.current?.(markerId),
      );
      const mapMarker = new maplibre.Marker({
        element,
        anchor: "center",
      })
        .setLngLat([marker.position.longitude, marker.position.latitude])
        .addTo(map);
      markerRefs.current.set(marker.id, mapMarker);
    });

    markerRefs.current.forEach((marker, markerId) => {
      if (visibleMarkerIds.has(markerId)) return;
      marker.remove();
      markerRefs.current.delete(markerId);
    });
  }, [mapLibreModuleRef, mapReady, mapRef, markers, selectedMarkerId]);

  useEffect(() => () => removeMarkers(markerRefs.current), []);
}
