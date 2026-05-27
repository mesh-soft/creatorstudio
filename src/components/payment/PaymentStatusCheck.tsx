"use client";

import { useEffect, useState } from "react";
import { PayBanner } from "./PayBanner";

interface Props {
  tenantId: string;
  paymentStatus: string;
  amount: number;
  validUntil: string;
  graceUntil: string;
}

/**
 * Checks payment status on mount and every 60 seconds.
 * If payment is pending, shows PayBanner.
 * If payment was completed externally (webhook), reloads to reflect updated subscription.
 */
export function PaymentStatusCheck({ tenantId, paymentStatus, amount, validUntil, graceUntil }: Props) {
  const [status, setStatus] = useState(paymentStatus);
  const [showBanner, setShowBanner] = useState(paymentStatus === "pending");

  useEffect(() => {
    if (paymentStatus !== "pending") return;

    const check = async () => {
      try {
        const res = await fetch(`/api/payment/status?tenantId=${tenantId}`);
        const data = await res.json();
        if (data.subscription?.paymentStatus === "paid") {
          setStatus("paid");
          setShowBanner(false);
          window.location.reload();
        }
      } catch {}
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [tenantId, paymentStatus]);

  if (!showBanner) return null;

  return <PayBanner tenantId={tenantId} amount={amount} />;
}
