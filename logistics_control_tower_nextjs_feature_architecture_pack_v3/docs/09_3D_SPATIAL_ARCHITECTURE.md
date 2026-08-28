# 3D / SPATIAL ARCHITECTURE

Free/open-source stack:
Three.js + React Three Fiber + Drei + GSAP + GLB/glTF.

Main experiences:
Command Center, Live Map, Route Planning, Tracking, Shipment route context.

Drill-down:
Global Network → Vietnam → Shipment Journey.

Keep R3F inside Client Components; do not mark the whole dashboard client-only.

Cross-feature 3D primitives may live in `components/three` only after real reuse. Feature scene composition stays local.

Use Zustand for spatial interaction state, not API entity caches.
Lazy-load heavy 3D so Billing/Admin do not load WebGL code.
