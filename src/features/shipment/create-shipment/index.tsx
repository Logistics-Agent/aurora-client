"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Upload, Loader2 } from "lucide-react";
import {
  AiInsight,
  ConfirmActionDialog,
  MetricCard,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { shipmentService } from "@/api/services/shipment.service";

const CREATE_STEPS = [
  "Shipment",
  "Locations",
  "Cargo",
  "Documents",
  "AI Planning",
  "Review",
];

export function CreateShipmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [customerName, setCustomerName] = useState("Acme Logistics");
  const [originAddress, setOriginAddress] = useState("San Jose Hub, Costa Rica");
  const [destAddress, setDestAddress] = useState("Panama City Port, Panama");
  const [cargoDesc, setCargoDesc] = useState("Consumer electronics & high-value equipment · 18,420 kg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setConfirm(false);
    try {
      const created = await shipmentService.createShipment({
        customerName,
        originAddress,
        destinationAddress: destAddress,
        originCountry: "CR",
        destinationCountry: "PA",
        cargoItems: [
          {
            name: cargoDesc.split("·")[0].trim() || "Commercial Cargo",
            quantity: 1,
            weightKg: 18420,
            hsCode: "8517.62",
          },
        ],
      });
      if (created?.id) {
        router.push(`/shipments/${created.id}`);
      } else {
        router.push("/shipments");
      }
    } catch {
      router.push("/shipments");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create Shipment"
        description="Configure new transport order and route planning dispatch."
        actions={<StatusBadge label={`Step ${step + 1} of 6`} intent="info" />}
      />
      <WorkspaceCard>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {CREATE_STEPS.map((label, index) => (
            <button
              type="button"
              key={label}
              onClick={() => setStep(index)}
              className={`space-y-2 text-left text-xs ${index <= step ? "text-primary" : "text-muted-foreground"}`}
            >
              <span
                className={`grid size-8 place-items-center rounded-full border font-semibold ${index < step ? "border-primary bg-primary text-white" : "border-border"}`}
              >
                {index < step ? <Check className="size-4" /> : index + 1}
              </span>
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">{CREATE_STEPS[step]}</h2>
          {step === 0 && (
            <label className="block max-w-md space-y-2 text-sm font-medium">
              Customer Name / Account
              <Input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Enter client company name"
              />
            </label>
          )}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Origin Facility</span>
                <Input
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  placeholder="Origin Address"
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Destination Facility</span>
                <Input
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                  placeholder="Destination Address"
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Cargo Description & Weight</span>
              <Textarea
                value={cargoDesc}
                onChange={(e) => setCargoDesc(e.target.value)}
              />
            </div>
          )}
          {step === 3 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Upload className="mx-auto size-7 text-primary" />
              <p className="mt-2 font-semibold">Bill of Lading & Commercial Invoice ready for auto-OCR</p>
            </div>
          )}
          {step === 4 && (
            <AiInsight
              result="Recommended corridor via Pan-American Highway has optimal transit speed."
              confidence={88}
              reason="Historical GPS telemetry and border crossing latency match policy."
              sources={["Aurora OSRM Engine", "Staff.BFF"]}
              timestamp="Realtime active"
              suggestedAction="Proceed to submission"
            />
          )}
          {step === 5 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Customer"
                value={customerName}
              />
              <MetricCard label="Route" value={`${originAddress.split(",")[0]} → ${destAddress.split(",")[0]}`} />
              <MetricCard
                label="Status"
                value={isSubmitting ? "Submitting..." : "Ready to Dispatch"}
              />
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              disabled={step === 0 || isSubmitting}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)}>
                Continue <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button disabled={isSubmitting} onClick={() => setConfirm(true)}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Create & Dispatch Shipment"
                )}
              </Button>
            )}
          </div>
        </div>
      </WorkspaceCard>
      <ConfirmActionDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Confirm Shipment Dispatch?"
        consequence="This will create a real shipment order in Staff.BFF and initiate route assignment."
        confirmLabel="Confirm & Create"
        onConfirm={handleSubmit}
      />
    </>
  );
}
