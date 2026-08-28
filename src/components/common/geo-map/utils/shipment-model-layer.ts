import {
  AmbientLight,
  BoxGeometry,
  Camera,
  DirectionalLight,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { MercatorCoordinate, type CustomLayerInterface } from "maplibre-gl";
import type { LogisticsGeoMarker } from "../types";

export const SHIPMENT_MODEL_LAYER_ID = "aurora-selected-shipment-3d";

export function canRenderShipmentModel(canvas: HTMLCanvasElement) {
  try {
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function createShipmentModelLayer(
  marker: LogisticsGeoMarker,
): CustomLayerInterface {
  let renderer: WebGLRenderer | undefined;
  let scene: Scene | undefined;
  let camera: Camera | undefined;
  const coordinate = MercatorCoordinate.fromLngLat(
    [marker.position.longitude, marker.position.latitude],
    0,
  );
  const scale = coordinate.meterInMercatorCoordinateUnits() * 16;

  return {
    id: SHIPMENT_MODEL_LAYER_ID,
    type: "custom",
    renderingMode: "3d",
    onAdd(mapInstance, gl) {
      camera = new Camera();
      scene = new Scene();
      const vehicle = new Group();
      const material = new MeshStandardMaterial({ color: 0x2f74ff });
      const body = new Mesh(new BoxGeometry(1.8, 0.75, 0.65), material);
      const cabin = new Mesh(new BoxGeometry(0.65, 0.75, 0.85), material);
      cabin.position.x = 1.05;
      cabin.position.z = 0.1;
      vehicle.add(body, cabin);
      vehicle.rotation.z = -((marker.heading ?? 90) * Math.PI) / 180;
      scene.add(vehicle, new AmbientLight(0xffffff, 1.2));
      const sun = new DirectionalLight(0xffffff, 1.8);
      sun.position.set(0, -10, 20);
      scene.add(sun);
      renderer = new WebGLRenderer({
        canvas: mapInstance.getCanvas(),
        context: gl,
        antialias: true,
      });
      renderer.autoClear = false;
    },
    render(_gl, options) {
      if (!renderer || !scene || !camera) return;
      const model = new Matrix4()
        .makeTranslation(coordinate.x, coordinate.y, coordinate.z)
        .scale(new Vector3(scale, -scale, scale));
      camera.projectionMatrix = new Matrix4()
        .fromArray(options.modelViewProjectionMatrix)
        .multiply(model);
      renderer.resetState();
      renderer.render(scene, camera);
    },
    onRemove() {
      scene?.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer?.dispose();
      renderer = undefined;
      scene = undefined;
      camera = undefined;
    },
  };
}
