import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "http://localhost" } },
    setupFiles: ["./vitest.setup.ts"],
    exclude: [...configDefaults.exclude, "tests/e2e/**", ".superpowers/**"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
