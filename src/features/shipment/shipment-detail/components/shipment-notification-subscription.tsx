"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotificationMutations } from "@/hooks/mutations/notifications/use-notification-mutations";

export type ShipmentNotificationSubscriptionProps = {
  shipmentId: string;
};

export function ShipmentNotificationSubscription({
  shipmentId,
}: ShipmentNotificationSubscriptionProps) {
  const { subscribeShipment } = useNotificationMutations();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubscribe = async () => {
    setHasError(false);

    try {
      await subscribeShipment.mutateAsync(shipmentId);
      setIsSubscribed(true);
    } catch {
      setHasError(true);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {hasError && (
        <p className="text-xs text-red-700" role="alert">
          Unable to subscribe to shipment notifications.
        </p>
      )}
      <Button
        type="button"
        size="sm"
        variant={isSubscribed ? "outline" : "default"}
        disabled={isSubscribed || subscribeShipment.isPending}
        onClick={() => void handleSubscribe()}
        aria-label={
          isSubscribed
            ? "Following shipment notifications"
            : "Follow shipment notifications"
        }
      >
        {isSubscribed
          ? "Following shipment notifications"
          : subscribeShipment.isPending
            ? "Following shipment..."
            : "Follow shipment notifications"}
      </Button>
    </div>
  );
}
