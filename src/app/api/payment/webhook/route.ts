import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const eventId  = req.headers.get("x-razorpay-event-id");
  const signature = req.headers.get("x-razorpay-signature");

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  if (!eventId || !signature) return NextResponse.json({ error: "Missing headers" }, { status: 400 });

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Signature error" }, { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(rawBody); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = await getDb();

  // Always save raw webhook for audit
  await db.collection("webhooks_raw").updateOne(
    { _id: eventId },
    { $setOnInsert: { receivedAt: new Date().toISOString(), headers: Object.fromEntries(req.headers.entries()), body: payload } },
    { upsert: true }
  );

  if (payload.event !== "payment.captured") {
    return NextResponse.json({ ok: true, event: payload.event, note: "acknowledged" });
  }

  const payment = payload.payload?.payment?.entity;
  if (!payment) return NextResponse.json({ ok: true, event: payload.event, note: "no payment entity" });

  const orderId   = payment.order_id;
  const paymentId = payment.id;
  const tenantId  = payment.notes?.tenantId || payment.notes?.tenant_id;
  if (!orderId || !tenantId) return NextResponse.json({ ok: true, event: payload.event, note: "missing orderId or tenantId" });

  const now = new Date().toISOString();
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const graceUntil = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();

  // Idempotent: only update if not already paid
  const result = await db.collection("payments").findOneAndUpdate(
    { razorpayOrderId: orderId, tenantId, status: { $ne: "paid" } },
    { $set: { status: "paid", razorpayPaymentId: paymentId, paidAt: now, validFrom: now, validUntil, graceUntil, updatedAt: now } },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ ok: true, event: payload.event, note: "already processed" });
  }

  await db.collection("users").updateOne(
    { _id: tenantId },
    { $set: { "subscription.paymentStatus": "paid", "subscription.paymentId": paymentId, "subscription.orderId": orderId, "subscription.validFrom": now, "subscription.validUntil": validUntil, "subscription.graceUntil": graceUntil, updatedAt: now } }
  );

  return NextResponse.json({ ok: true, event: payload.event, tenantId, paymentId, status: "paid" });
}
