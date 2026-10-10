"use client";

import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  pulsePhase: number;
  name: string;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  color: string;
}

interface LogisticsArc {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
  color: string;
}

export function AuroraGalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width - 0.5) * 2;
      mouseY = (e.clientY / height - 0.5) * 2;
      targetRotX = mouseY * 0.35;
      targetRotY = mouseX * 0.45;
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // ── 1. Create Galaxy Stars ────────────────────────────────────────────────
    const PARTICLE_COUNT = 140;
    const particles: Particle3D[] = [];
    const colors = ["#38bdf8", "#06b6d4", "#818cf8", "#a7f3d0", "#93c5fd"];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        z: Math.random() * 1200 + 100,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        vz: -0.4 - Math.random() * 0.5,
        size: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // ── 2. Create 3D Logistics Globe Nodes ────────────────────────────────────
    const globeRadius = Math.min(window.innerWidth, window.innerHeight) * 0.38;
    const hubNames = [
      "SGP-HUB", "LAX-PORT", "ROT-GATE", "DXB-CARGO", "NRT-AIR",
      "FRA-LOG", "HKG-TERM", "SYD-GATE", "PAN-CANAL", "SVO-ROUTE",
      "ICN-HUB", "PVG-SEA", "BUS-OCEAN", "HAM-PORT", "JFK-CARGO"
    ];

    const nodes: Node3D[] = hubNames.map((name, i) => {
      // Golden spiral distribution on sphere
      const phi = Math.acos(-1 + (2 * i) / hubNames.length);
      const theta = Math.sqrt(hubNames.length * Math.PI) * phi;

      const baseX = globeRadius * Math.sin(phi) * Math.cos(theta);
      const baseY = globeRadius * Math.sin(phi) * Math.sin(theta);
      const baseZ = globeRadius * Math.cos(phi);

      return {
        x: baseX,
        y: baseY,
        z: baseZ,
        baseX,
        baseY,
        baseZ,
        size: 3.5,
        pulsePhase: Math.random() * Math.PI * 2,
        name,
      };
    });

    // ── 3. Create Logistics Supply Route Arcs ─────────────────────────────────
    const arcs: LogisticsArc[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Connect nearby nodes
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const dz = nodes[i].baseZ - nodes[j].baseZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < globeRadius * 1.25) {
          arcs.push({
            fromIndex: i,
            toIndex: j,
            progress: Math.random(),
            speed: 0.003 + Math.random() * 0.004,
            color: Math.random() > 0.5 ? "#0284c7" : "#06b6d4",
          });
        }
      }
    }

    // ── 4. Main Render Loop ───────────────────────────────────────────────────
    let globeAngleY = 0;
    let globeAngleX = 0.2;
    let waveTime = 0;

    const render = () => {
      const displayW = window.innerWidth;
      const displayH = window.innerHeight;
      const centerX = displayW / 2;
      const centerY = displayH / 2;
      const fov = 700;

      ctx.clearRect(0, 0, displayW, displayH);

      // Smooth mouse tilt
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      globeAngleY += 0.0025;
      waveTime += 0.015;

      // ── Draw Aurora Ribbon Waves (Background) ─────────────────────────────
      const numWaves = 4;
      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        const baseHeight = displayH * (0.28 + w * 0.16);
        const amplitude = 45 + w * 15;
        const freq = 0.0025 + w * 0.001;
        const speedOffset = waveTime * (0.8 + w * 0.4);

        ctx.moveTo(0, displayH);
        for (let x = 0; x <= displayW; x += 15) {
          const y =
            baseHeight +
            Math.sin(x * freq + speedOffset) * amplitude +
            Math.cos(x * freq * 0.6 - speedOffset * 0.7) * (amplitude * 0.6);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(displayW, displayH);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseHeight - 60, displayW, baseHeight + 120);
        if (w === 0) {
          grad.addColorStop(0, "rgba(56, 189, 248, 0.12)");
          grad.addColorStop(0.5, "rgba(6, 182, 212, 0.18)");
          grad.addColorStop(1, "rgba(99, 102, 241, 0.08)");
        } else if (w === 1) {
          grad.addColorStop(0, "rgba(6, 182, 212, 0.10)");
          grad.addColorStop(0.5, "rgba(16, 185, 129, 0.14)");
          grad.addColorStop(1, "rgba(14, 165, 233, 0.08)");
        } else if (w === 2) {
          grad.addColorStop(0, "rgba(99, 102, 241, 0.08)");
          grad.addColorStop(0.5, "rgba(56, 189, 248, 0.12)");
          grad.addColorStop(1, "rgba(168, 85, 247, 0.06)");
        } else {
          grad.addColorStop(0, "rgba(14, 165, 233, 0.07)");
          grad.addColorStop(0.5, "rgba(45, 212, 191, 0.11)");
          grad.addColorStop(1, "rgba(59, 130, 246, 0.06)");
        }
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── Draw 3D Stars & Galaxy Dust ───────────────────────────────────────
      for (const p of particles) {
        p.z += p.vz;
        p.x += p.vx;
        p.y += p.vy;

        // Reset if behind camera
        if (p.z <= 10) {
          p.z = 1200;
          p.x = (Math.random() - 0.5) * 1600;
          p.y = (Math.random() - 0.5) * 1200;
        }

        const scale = fov / (fov + p.z);
        const px = centerX + p.x * scale;
        const py = centerY + p.y * scale;

        if (px >= 0 && px <= displayW && py >= 0 && py <= displayH) {
          const radius = Math.max(0.6, p.size * scale);
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, p.opacity * scale * 1.5);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // ── Transform & Project 3D Logistics Nodes ────────────────────────────
      const totalRotY = globeAngleY + currentRotY;
      const totalRotX = globeAngleX + currentRotX;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      const projectedNodes: { px: number; py: number; scale: number; z: number; node: Node3D }[] = [];

      for (const node of nodes) {
        // Rotate Y
        const x1 = node.baseX * cosY - node.baseZ * sinY;
        const z1 = node.baseX * sinY + node.baseZ * cosY;

        // Rotate X
        const y2 = node.baseY * cosX - z1 * sinX;
        const z2 = node.baseY * sinX + z1 * cosX;

        node.x = x1;
        node.y = y2;
        node.z = z2;

        const distance = fov + z2;
        if (distance > 20) {
          const scale = fov / distance;
          const px = centerX + x1 * scale;
          const py = centerY + y2 * scale;
          projectedNodes.push({ px, py, scale, z: z2, node });
        }
      }

      // Sort back to front for proper 3D layering
      projectedNodes.sort((a, b) => b.z - a.z);

      // ── Draw 3D Logistics Supply Route Lines & Arcs ────────────────────────
      for (const arc of arcs) {
        const fromProj = projectedNodes.find((p) => p.node === nodes[arc.fromIndex]);
        const toProj = projectedNodes.find((p) => p.node === nodes[arc.toIndex]);

        if (fromProj && toProj) {
          const isFront = fromProj.z > -globeRadius * 0.4 && toProj.z > -globeRadius * 0.4;
          const alpha = isFront ? 0.28 : 0.08;

          // Arc Curve Control Point
          const midX = (fromProj.px + toProj.px) / 2;
          const midY = (fromProj.py + toProj.py) / 2 - 35 * fromProj.scale;

          ctx.beginPath();
          ctx.moveTo(fromProj.px, fromProj.py);
          ctx.quadraticCurveTo(midX, midY, toProj.px, toProj.py);
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = isFront ? 1.4 : 0.7;
          ctx.globalAlpha = alpha;
          ctx.stroke();

          // Animated moving supply signal / cargo packet along route
          arc.progress = (arc.progress + arc.speed) % 1;
          const t = arc.progress;
          // Quadratic bezier interpolation
          const packetX = (1 - t) * (1 - t) * fromProj.px + 2 * (1 - t) * t * midX + t * t * toProj.px;
          const packetY = (1 - t) * (1 - t) * fromProj.py + 2 * (1 - t) * t * midY + t * t * toProj.py;

          if (isFront) {
            ctx.beginPath();
            ctx.arc(packetX, packetY, 2.8 * fromProj.scale, 0, Math.PI * 2);
            ctx.fillStyle = "#38bdf8";
            ctx.globalAlpha = 0.85;
            ctx.shadowColor = "#0284c7";
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // ── Draw 3D Logistics Nodes (Hubs & Ports) ──────────────────────────────
      for (const p of projectedNodes) {
        const isFront = p.z > -globeRadius * 0.3;
        const nodeRadius = p.node.size * p.scale;

        // Pulse ring
        p.node.pulsePhase += 0.04;
        const pulseSize = (nodeRadius * 1.6) + Math.sin(p.node.pulsePhase) * 2;

        ctx.beginPath();
        ctx.arc(p.px, p.py, pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = isFront ? "rgba(14, 165, 233, 0.45)" : "rgba(14, 165, 233, 0.15)";
        ctx.lineWidth = 1;
        ctx.globalAlpha = isFront ? 0.8 : 0.25;
        ctx.stroke();

        // Node center
        ctx.beginPath();
        ctx.arc(p.px, p.py, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isFront ? "#0284c7" : "#94a3b8";
        ctx.globalAlpha = isFront ? 0.95 : 0.35;
        ctx.fill();

        // Node label on hover or when prominent in front
        if (isFront && p.scale > 1.05) {
          ctx.font = "9px 'Inter', sans-serif";
          ctx.fillStyle = "#0369a1";
          ctx.globalAlpha = 0.75;
          ctx.fillText(p.node.name, p.px + 8, p.py + 3);
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    handleResize();
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
