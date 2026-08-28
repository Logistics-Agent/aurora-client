"use client";

import { useState } from "react";
import { Check, ChevronRight, Upload } from "lucide-react";
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
import { createShipmentReference } from "../mock";

const CREATE_STEPS = [
  "Shipment",
  "Locations",
  "Cargo",
  "Documents",
  "AI Planning",
  "Review",
];

export function CreateShipmentPage() {
  const [step, setStep] = useState(0);
  const [reference, setReference] = useState("SHP-2026-00129");
  const [submitted, setSubmitted] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <PageHeader
        title="Create Shipment"
        description="Six-step local draft flow with editable state."
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
              Reference
              <Input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </label>
          )}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue="VSIP Warehouse · Ho Chi Minh City" />
              <Input defaultValue="Singapore Port" />
            </div>
          )}
          {step === 2 && (
            <Textarea defaultValue="Consumer electronics · 18,420 kg" />
          )}
          {step === 3 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Upload className="mx-auto size-7 text-primary" />
              <p className="mt-2 font-semibold">3 documents selected locally</p>
            </div>
          )}
          {step === 4 && (
            <AiInsight
              result="Recommended route has a 35-minute ETA buffer."
              confidence={82}
              reason="Port schedule and cargo constraints match."
              sources={["Local route mock"]}
              timestamp="Prepared locally"
              suggestedAction="Review before submission"
            />
          )}
          {step === 5 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Reference"
                value={createShipmentReference(reference)}
              />
              <MetricCard label="Route" value="HCM → Singapore" />
              <MetricCard
                label="State"
                value={submitted ? "Submitted locally" : "Ready"}
              />
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)}>
                Continue <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button disabled={submitted} onClick={() => setConfirm(true)}>
                Submit mock shipment
              </Button>
            )}
          </div>
        </div>
      </WorkspaceCard>
      <ConfirmActionDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Submit shipment draft?"
        consequence="Only local state changes; no backend request is made."
        confirmLabel="Submit locally"
        onConfirm={() => {
          setSubmitted(true);
          setConfirm(false);
        }}
      />
    </>
  );
}
