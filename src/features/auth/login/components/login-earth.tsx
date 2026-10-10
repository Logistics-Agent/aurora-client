"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// UI-only geographic examples. These are not shipment or live network data.
const hubs = [
  [10.76, 106.79], // Cat Lai
  [1.29, 103.85], // Singapore
  [31.23, 121.47], // Shanghai
  [35.68, 139.69], // Tokyo
  [25.2, 55.27], // Dubai
  [51.92, 4.48], // Rotterdam
] as const;
const routes = [
  { from: 0, to: 1, altitude: .025 },
  { from: 1, to: 2, altitude: .06 },
  { from: 2, to: 3, altitude: .17 },
  { from: 1, to: 4, altitude: .25 },
  { from: 4, to: 5, altitude: .2 },
] as const;

function position(latitude: number, longitude: number, radius = 1) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lng = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(Math.cos(lat) * Math.cos(lng), Math.sin(lat), -Math.cos(lat) * Math.sin(lng)).multiplyScalar(radius);
}

export default function LoginEarth() {
  const host = useRef<HTMLDivElement>(null);
  const fallback = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const showFallback = () => { if (fallback.current) fallback.current.hidden = false; };
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      showFallback();
      return;
    }
    let disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 30);
    camera.position.copy(position(20, 105, 3.25));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute("aria-label", "Interactive Earth. Drag or use arrow keys to rotate.");
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = .055;
    controls.rotateSpeed = .35;
    controls.minPolarAngle = .45;
    controls.maxPolarAngle = Math.PI - .45;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ambient = new THREE.AmbientLight(0xb3cae3, 1.25);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff1df, 3.2);
    sun.position.copy(position(45, 55, 5));
    scene.add(sun);
    const surface = new THREE.MeshStandardMaterial({ color: 0x8ba2b0, roughness: .82, metalness: .08 });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), surface);
    scene.add(sphere);
    const texture = new THREE.TextureLoader().load("/auth/earth_atmos_2048.jpg", (map) => {
      if (disposed) { map.dispose(); return; }
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      surface.color.set(0xffffff);
      surface.map = map;
      surface.needsUpdate = true;
    }, undefined, () => { if (!disposed) showFallback(); });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.025, 64, 40), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide,
      vertexShader: `varying vec3 n; varying vec3 v;
        void main(){ vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p; }`,
      fragmentShader: `varying vec3 n; varying vec3 v;
        void main(){ float rim=pow(1.-abs(dot(normalize(n),normalize(v))),3.); gl_FragColor=vec4(.4,.61,.83,rim*.22); }`,
    }));
    scene.add(atmosphere);
    const network = new THREE.Group();
    scene.add(network);
    const markerGeometry = new THREE.SphereGeometry(.008, 12, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xf5d3a0, transparent: true });
    for (const [lat, lng] of hubs) {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position(lat, lng, 1.008));
      network.add(marker);
      const ring = new THREE.Mesh(new THREE.RingGeometry(.013, .016, 24), markerMaterial);
      ring.position.copy(position(lat, lng, 1.009));
      ring.lookAt(ring.position.clone().multiplyScalar(2));
      network.add(ring);
    }
    const moving = routes.map(({ from, to, altitude }) => {
      const a = position(hubs[from][0], hubs[from][1]);
      const b = position(hubs[to][0], hubs[to][1]);
      const points = Array.from({ length: 97 }, (_, i) => {
        const t = i / 96;
        return a.clone().lerp(b, t).normalize().multiplyScalar(1.012 + Math.sin(t * Math.PI) * altitude);
      });
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: altitude > .1 ? 0xe3c398 : 0x8dbacc, transparent: true, opacity: .65 }));
      network.add(line);
      const particle = new THREE.Mesh(new THREE.SphereGeometry(.005, 8, 6), markerMaterial);
      network.add(particle);
      return { curve, particle, geometry };
    });
    let elapsed = 0;
    let previous = 0;
    let releasedAt = 0;
    let dragging = false;
    const start = () => { dragging = true; };
    const end = () => { dragging = false; releasedAt = elapsed; };
    controls.addEventListener("start", start);
    controls.addEventListener("end", end);
    const key = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const spherical = new THREE.Spherical().setFromVector3(camera.position);
      spherical.theta += event.key === "ArrowLeft" ? -.08 : event.key === "ArrowRight" ? .08 : 0;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + (event.key === "ArrowUp" ? -.08 : event.key === "ArrowDown" ? .08 : 0), .45, Math.PI - .45);
      camera.position.setFromSpherical(spherical);
      releasedAt = elapsed;
      controls.update();
    };
    renderer.domElement.addEventListener("keydown", key);
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resize.observe(container);
    const render = (time: number) => {
      const dt = previous ? Math.min((time - previous) / 1000, .05) : 0;
      previous = time;
      elapsed += dt;
      if (!motion.matches && !dragging && releasedAt === 0 && elapsed < 1.2) {
        camera.position.setLength(3.25 + .12 * Math.pow(1 - elapsed / 1.2, 2));
      }
      markerMaterial.opacity = motion.matches ? 1 : THREE.MathUtils.clamp((elapsed - .7) / .6, 0, 1);
      controls.autoRotate = !motion.matches && !dragging;
      controls.autoRotateSpeed = .12 * THREE.MathUtils.clamp((elapsed - releasedAt) / 3, 0, 1);
      controls.update(dt);
      moving.forEach(({ curve, particle, geometry }, i) => {
        particle.visible = motion.matches || elapsed > 1.3;
        curve.getPointAt(motion.matches ? .4 : (elapsed * .035 + i * .17) % 1, particle.position);
        geometry.setDrawRange(0, motion.matches ? 97 : Math.round(97 * THREE.MathUtils.clamp((elapsed - .6) / 1.1, 0, 1)));
      });
      renderer.render(scene, camera);
    };
    const visibility = () => { previous = 0; renderer.setAnimationLoop(document.hidden ? null : render); };
    const contextLost = (event: Event) => { event.preventDefault(); renderer.setAnimationLoop(null); showFallback(); };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("keydown", key);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      controls.dispose();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry);
          if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material));
          else materials.add(object.material);
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host}><p ref={fallback} hidden role="status" className="absolute left-1/4 top-1/2 text-xs text-muted-foreground">Earth preview unavailable. You can still sign in.</p></div>;
}
