import { accessSync, constants, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const REQUIRED_FILES = [
  "maplibre-gl-worker.mjs",
  "maplibre-gl-shared.mjs",
];

const publicMaplibreDir = path.join(process.cwd(), "public", "maplibre");

// 1. Filesystem checks
for (const filename of REQUIRED_FILES) {
  const filePath = path.join(publicMaplibreDir, filename);
  try {
    accessSync(filePath, constants.R_OK);
    const stats = statSync(filePath);
    if (stats.size === 0) {
      console.error(`[check-maplibre-assets] Error: ${filename} is empty (0 bytes).`);
      process.exit(1);
    }
    execFileSync(process.execPath, ["--check", filePath], { stdio: "pipe" });
  } catch (err) {
    console.error(
      `[check-maplibre-assets] Error: missing, unreadable, or invalid JavaScript asset: ${filePath}`,
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }
}

// 2. Optional HTTP checks when server URL is provided
const serverUrlArg = process.argv.slice(2).find((arg) => arg.startsWith("http://") || arg.startsWith("https://")) ||
  process.env.MAPLIBRE_SMOKE_SERVER_URL;

if (serverUrlArg) {
  const baseUrl = serverUrlArg.replace(/\/+$/, "");
  console.log(`[check-maplibre-assets] Verifying HTTP endpoints against ${baseUrl}...`);

  for (const filename of REQUIRED_FILES) {
    const url = `${baseUrl}/maplibre/${filename}`;
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      if (!res.ok) {
        console.error(`[check-maplibre-assets] Error: HTTP ${res.status} when fetching ${url}`);
        process.exit(1);
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("javascript") && !contentType.includes("text/")) {
        console.error(
          `[check-maplibre-assets] Error: unexpected content-type "${contentType}" for ${url} (expected javascript).`,
        );
        process.exit(1);
      }
    } catch (err) {
      console.error(
        `[check-maplibre-assets] Error: failed network request to ${url}`,
        err instanceof Error ? err.message : err,
      );
      process.exit(1);
    }
  }
}

console.log("✓ MapLibre runtime assets verified successfully.");
