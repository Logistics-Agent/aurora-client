"use client";

import {
  AlertTriangle,
  Check,
  GitCompareArrows,
  RotateCcw,
  Satellite,
  Sparkles,
} from "lucide-react";
import {
  AiInsight,
  LogisticsGeoMap,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  routeAcceptanceFixture,
  routeAlternatives,
  routePlanningMapMock,
} from "./mock";
import { useRoutePlanningStore } from "./stores/use-route-planning-store";
import { nextMapAvailability } from "../utils/fixture-state";

export function RoutePlanningPage() {
  const selectedRouteId = useRoutePlanningStore(
    (state) => state.selectedRouteId,
  );
  const mapAvailability = useRoutePlanningStore(
    (state) => state.mapAvailability,
  );
  const calculationState = useRoutePlanningStore(
    (state) => state.calculationState,
  );
  const acceptedRouteId = useRoutePlanningStore(
    (state) => state.acceptedRouteId,
  );
  const selectRoute = useRoutePlanningStore((state) => state.selectRoute);
  const setMapAvailability = useRoutePlanningStore(
    (state) => state.setMapAvailability,
  );
  const setCalculationState = useRoutePlanningStore(
    (state) => state.setCalculationState,
  );
  const acceptRoute = useRoutePlanningStore((state) => state.acceptRoute);
  const selectedRoute = routeAlternatives.find(
    (route) => route.id === selectedRouteId,
  );
  const acceptedRoute = routeAlternatives.find(
    (route) => route.id === acceptedRouteId,
  );

  return (
    <>
      <PageHeader
        title="Route Planning"
        description="SHP-2026-00128 · HCM Warehouse → Singapore · human acceptance required"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setMapAvailability(nextMapAvailability(mapAvailability))
              }
            >
              <Satellite className="size-4" />
              Map · {mapAvailability}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCalculationState("failed")}
              disabled={calculationState === "failed"}
            >
              Simulate failure
            </Button>
          </div>
        }
      />
      {acceptedRoute && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <p className="font-semibold">
            {acceptedRoute.name} selected by {routeAcceptanceFixture.reviewer} ·{" "}
            {routeAcceptanceFixture.timestamp}
          </p>
          <span className="text-xs">
            Local approval fixture · not dispatched
          </span>
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <WorkspaceCard>
          {calculationState === "failed" ? (
            <div className="grid min-h-[32rem] place-items-center rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="max-w-sm space-y-3">
                <AlertTriangle className="mx-auto size-7 text-red-600" />
                <p className="font-semibold text-red-900">
                  Route calculation failed
                </p>
                <p className="text-sm text-red-700">
                  Restrictions could not be reconciled. Existing shipment data
                  is unchanged.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCalculationState("ready")}
                >
                  <RotateCcw className="size-4" />
                  Retry calculation
                </Button>
              </div>
            </div>
          ) : (
            <LogisticsGeoMap
              className="min-h-[32rem]"
              routes={routePlanningMapMock.routes}
              markers={routePlanningMapMock.markers}
              selectedRouteId={selectedRouteId}
              loading={mapAvailability === "loading"}
              unavailable={mapAvailability === "unavailable"}
              onRetry={() => setMapAvailability("available")}
            />
          )}
        </WorkspaceCard>

        <WorkspaceCard title="Proposed routes">
          <div className="space-y-3">
            {routeAlternatives.map((route) => (
              <button
                type="button"
                key={route.id}
                onClick={() => selectRoute(route.id)}
                disabled={calculationState === "failed"}
                aria-pressed={selectedRouteId === route.id}
                aria-label={`Choose ${route.name}`}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedRouteId === route.id ? "border-primary bg-blue-50" : "border-border hover:bg-secondary"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{route.name}</span>
                  {route.recommended ? (
                    <StatusBadge label="AI Recommended" intent="ai" />
                  ) : (
                    <StatusBadge label="Alternative" intent="neutral" />
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {route.distance} · {route.duration} · {route.cost} ·{" "}
                  {route.risk}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <AiInsight
              result="Route A has the lowest overall delay risk."
              confidence={88}
              reason="Traffic, restrictions and carrier capacity are favorable."
              sources={["GPS fleet", "Traffic feed", "Restriction fixture"]}
              timestamp="10:42 ICT · mock snapshot"
              suggestedAction="Human must accept the route"
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-between gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  <GitCompareArrows className="size-4" />
                  Compare routes
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-2xl"
                aria-label="Route comparison"
              >
                <DialogHeader>
                  <DialogTitle>Route comparison</DialogTitle>
                  <DialogDescription>
                    3 route alternatives · fixture snapshot · human decision
                    required
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-lg text-left text-sm">
                    <thead className="border-b text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2">Route</th>
                        <th>Distance</th>
                        <th>Duration</th>
                        <th>Cost</th>
                        <th>Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routeAlternatives.map((route) => (
                        <tr key={route.id} className="border-b last:border-0">
                          <td className="py-3 font-semibold">{route.name}</td>
                          <td>{route.distance}</td>
                          <td>{route.duration}</td>
                          <td>{route.cost}</td>
                          <td>{route.risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              disabled={!selectedRoute || calculationState === "failed"}
              onClick={() => selectedRoute && acceptRoute(selectedRoute.id)}
            >
              <Check className="size-4" />
              Accept {selectedRoute?.name ?? "route"}
            </Button>
          </div>
          <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3" /> Fixture selection is local and does
            not dispatch a vehicle.
          </p>
        </WorkspaceCard>
      </div>
    </>
  );
}
