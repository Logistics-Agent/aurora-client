"use client";

import { useEffect, useState } from "react";

export type WebglCapability = "checking" | "supported" | "unsupported";

export function detectWebglCapability(canvas: HTMLCanvasElement) {
  try {
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function useWebglCapability(): WebglCapability {
  const [capability, setCapability] = useState<WebglCapability>("checking");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (navigator.userAgent.toLowerCase().includes("jsdom")) {
        setCapability("unsupported");
        return;
      }

      const canvas = document.createElement("canvas");
      setCapability(
        detectWebglCapability(canvas) ? "supported" : "unsupported",
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return capability;
}
