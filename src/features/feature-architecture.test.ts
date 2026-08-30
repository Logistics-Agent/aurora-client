import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

const nestedPageIndexes = [
  "auth/login/index.tsx",
  "auth/forgot-password/index.tsx",
  "auth/select-tenant/index.tsx",
  "shipment/shipments/index.tsx",
  "shipment/shipment-detail/index.tsx",
  "shipment/create-shipment/index.tsx",
  "shipment/import-shipments/index.tsx",
  "administration/users/index.tsx",
  "administration/roles/index.tsx",
  "administration/tenant-settings/index.tsx",
  "administration/audit-log/index.tsx",
  "administration/ai-operations/index.tsx",
  "administration/ai-execution-detail/index.tsx",
  "commercial/cost-estimate/index.tsx",
  "commercial/negotiations/index.tsx",
  "commercial/negotiation-detail/index.tsx",
  "commercial/billing/index.tsx",
  "commercial/invoice-detail/index.tsx",
  "documents/document-center/index.tsx",
  "documents/upload-document/index.tsx",
  "documents/ocr-review/index.tsx",
  "compliance/compliance-center/index.tsx",
  "compliance/compliance-detail/index.tsx",
  "email-agent/inbox/index.tsx",
  "email-agent/email-detail/index.tsx",
  "notifications/notification-center/index.tsx",
  "route-tracking/route-planning/index.tsx",
  "route-tracking/live-map/index.tsx",
  "route-tracking/shipment-tracking/index.tsx",
  "customer-portal/overview/index.tsx",
  "customer-portal/shipments/index.tsx",
  "customer-portal/shipment-detail/index.tsx",
  "customer-portal/tracking/index.tsx",
  "customer-portal/documents/index.tsx",
  "customer-portal/quotes/index.tsx",
  "customer-portal/invoices/index.tsx",
  "customer-portal/assistant/index.tsx",
  "customer-portal/notifications/index.tsx",
] as const;

const forbiddenMonoliths = [
  "shipment/components/shipment-workspace.tsx",
  "administration/components/admin-workspace.tsx",
  "commercial/components/commercial-workspace.tsx",
  "documents/components/document-workspace.tsx",
  "compliance/components/compliance-workspace.tsx",
  "email-agent/components/email-workspace.tsx",
  "notifications/components/notification-workspace.tsx",
  "ai-assistant/components/assistant-workspace.tsx",
  "command-center/components/command-center-workspace.tsx",
  "route-tracking/workspaces/route-planning/route-planning-workspace.tsx",
  "route-tracking/workspaces/live-map/live-map-workspace.tsx",
  "route-tracking/workspaces/shipment-tracking/shipment-tracking-workspace.tsx",
  "customer-portal/workspaces/overview/overview-workspace.tsx",
  "customer-portal/workspaces/shipments/shipments-workspace.tsx",
  "customer-portal/workspaces/shipment-detail/shipment-detail-workspace.tsx",
  "customer-portal/workspaces/tracking/tracking-workspace.tsx",
  "customer-portal/workspaces/documents/documents-workspace.tsx",
  "customer-portal/workspaces/quotes/quotes-workspace.tsx",
  "customer-portal/workspaces/invoices/invoices-workspace.tsx",
  "customer-portal/workspaces/assistant/assistant-workspace.tsx",
  "customer-portal/workspaces/notifications/notifications-workspace.tsx",
] as const;

const rootCompositionIndexes = [
  "ai-assistant/index.tsx",
  "command-center/index.tsx",
] as const;

const dynamicRouteAdapters = [
  "src/app/(dashboard)/shipments/[shipmentId]/tracking/page.tsx",
  "src/app/(customer)/portal/shipments/[shipmentId]/page.tsx",
  "src/app/(customer)/portal/shipments/[shipmentId]/tracking/page.tsx",
] as const;

const routeTrackingLocalOwnership = [
  "route-tracking/route-planning/mock/index.ts",
  "route-tracking/route-planning/stores/use-route-planning-store.ts",
  "route-tracking/live-map/mock/index.ts",
  "route-tracking/live-map/stores/use-live-map-store.ts",
  "route-tracking/shipment-tracking/mock/index.ts",
  "route-tracking/shipment-tracking/stores/use-shipment-tracking-store.ts",
] as const;

function featurePath(relativePath: string) {
  return resolve(projectRoot, "src/features", relativePath);
}

describe("feature ownership architecture", () => {
  it("uses singular src/lib for shared infrastructure", () => {
    expect(existsSync(resolve(projectRoot, "src/libs"))).toBe(false);
    expect(existsSync(resolve(projectRoot, "src/lib/query-client.ts"))).toBe(
      true,
    );
    expect(existsSync(resolve(projectRoot, "src/lib/query/index.ts"))).toBe(
      false,
    );
  });

  it.each(nestedPageIndexes)("owns page composition at %s", (relativePath) => {
    const path = featurePath(relativePath);
    expect(existsSync(path), `${relativePath} must exist`).toBe(true);

    if (existsSync(path)) {
      const source = readFileSync(path, "utf8");
      expect(source).toMatch(/export function \w+Page/);
      expect(source.trim()).not.toMatch(/^export \{[^}]+\} from/m);
    }
  });

  it.each(forbiddenMonoliths)(
    "does not retain route monolith %s",
    (relativePath) => {
      expect(existsSync(featurePath(relativePath))).toBe(false);
    },
  );

  it.each(rootCompositionIndexes)(
    "keeps single-screen composition in %s",
    (relativePath) => {
      const source = readFileSync(featurePath(relativePath), "utf8");
      expect(source).toMatch(/<PageHeader/);
      expect(source).not.toMatch(/Workspace from/);
    },
  );

  it.each(dynamicRouteAdapters)("forwards shipmentId in %s", (relativePath) => {
    const source = readFileSync(resolve(projectRoot, relativePath), "utf8");
    expect(source).toMatch(/params: Promise<\{ shipmentId: string \}>/);
    expect(source).toMatch(/shipmentId=\{shipmentId\}/);
  });

  it.each(routeTrackingLocalOwnership)(
    "keeps route/tracking ownership local at %s",
    (relativePath) => {
      expect(existsSync(featurePath(relativePath))).toBe(true);
    },
  );

  it("does not recreate a route-tracking-wide mock or workspace store", () => {
    expect(existsSync(featurePath("route-tracking/mock"))).toBe(false);
    expect(existsSync(featurePath("route-tracking/stores"))).toBe(false);
  });

  it("keeps the real map engine shared and geographic data feature-local", () => {
    expect(
      existsSync(
        resolve(
          projectRoot,
          "src/components/common/geo-map/logistics-geo-map.tsx",
        ),
      ),
    ).toBe(true);

    const featureSources = [
      "route-tracking/route-planning/index.tsx",
      "route-tracking/live-map/index.tsx",
      "route-tracking/shipment-tracking/index.tsx",
    ].map((relativePath) => readFileSync(featurePath(relativePath), "utf8"));
    expect(featureSources.join("\n")).not.toMatch(/from ["']maplibre-gl["']/);

    const fixtureSources = [
      "route-tracking/route-planning/mock/index.ts",
      "route-tracking/live-map/mock/index.ts",
      "route-tracking/shipment-tracking/mock/index.ts",
    ].map((relativePath) => readFileSync(featurePath(relativePath), "utf8"));
    expect(fixtureSources.join("\n")).toMatch(/longitude/);
    expect(fixtureSources.join("\n")).not.toMatch(/\bpath:/);
  });
});
