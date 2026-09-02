import { renderToStaticMarkup } from "react-dom/server.browser";
import {
  MapLocationMarkerIcon,
  ShipmentMarkerIcon,
} from "@/components/icons";
import type { LogisticsGeoMarker } from "../types";
import { getMarkerPresentation } from "./marker-presentation";

function getMarkerLabel(marker: LogisticsGeoMarker) {
  const presentation = getMarkerPresentation(marker);
  return presentation
    ? `${marker.label} · ${presentation.mode} · ${presentation.status}`
    : marker.label;
}

export function updateShipmentMapMarker(
  element: HTMLElement,
  marker: LogisticsGeoMarker,
) {
  const presentation = getMarkerPresentation(marker);

  element.setAttribute("aria-label", getMarkerLabel(marker));
  element.title = getMarkerLabel(marker);
  element.innerHTML = renderToStaticMarkup(
    presentation ? (
      <ShipmentMarkerIcon
        mode={presentation.mode}
        status={presentation.status}
        aria-hidden="true"
      />
    ) : (
      <MapLocationMarkerIcon tone={marker.tone} aria-hidden="true" />
    ),
  );
  return true;
}

export function createShipmentMapMarker(
  marker: LogisticsGeoMarker,
  onSelect: (markerId: string) => void,
) {
  const element = document.createElement("button");
  element.type = "button";
  element.className =
    "cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelect(marker.id);
  });
  updateShipmentMapMarker(element, marker);
  return element;
}
