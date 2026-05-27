"use client";

import { useState } from "react";

interface PayBannerProps {
  tenantId: string;
  amount: number; // in INR
}

declare global {
  interface Window { Razorpay: any }
}

export function PayBanner({ tenantId, amount }: PayBannerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Failed");

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "Site Subscription",
          description: "Activate your site",
          order_id: data.orderId,
          handler: async function (response: any) {
            const vRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tenantId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const vData = await vRes.json();
            if (vData.ok) {
              setPaid(true);
              setTimeout(() => window.location.reload(), 1500);
            } else {
              setError(vData.error ?? "Verification failed");
            }
          },
          modal: { ondismiss: () => setLoading(false) },
          prefill: { contact: "", email: "" },
          theme: { color: "#79589f" },
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setLoading(false);
    }
  };

  if (paid) return <Banner color="#22c55e">✓ Payment successful! Reloading…</Banner>;

  return (
    <Banner color="#79589f">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span>This site subscription is pending payment. Activate your site to remove this banner.</span>
        <button onClick={handlePay} disabled={loading}
          style={{
            padding: "10px 24px", borderRadius: 8, border: "none",
            background: "#fff", color: "#79589f", fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          }}>
          {loading ? "Opening…" : `Pay ₹${amount}`}
        </button>
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>{error}</div>}
    </Banner>
  );
}

function Banner({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: color, color: "#fff", padding: "16px 24px",
      fontSize: 14, fontWeight: 500, fontFamily: "Inter, system-ui, sans-serif",
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
      boxShadow: "0 2px 12px rgba(0,0,0,.15)",
    }}>
      {children}
    </div>
  );
}
