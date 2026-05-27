import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let body: any;
  try { body = JSON.parse(rawBody); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { tenantId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;
  if (!tenantId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });

  const body2 = razorpayOrderId + "|" + razorpayPaymentId;
  const expected = createHmac("sha256", secret).update(body2).digest("hex");
  if (expected !== razorpaySignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const graceUntil = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();

  const result = await db.collection("payments").findOneAndUpdate(
    { razorpayOrderId, tenantId, status: { $ne: "paid" } },
    { $set: { status: "paid", razorpayPaymentId, paidAt: now, validFrom: now, validUntil, graceUntil, updatedAt: now } },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ ok: true, note: "already processed" });
  }

  await db.collection("users").updateOne(
    { _id: tenantId },
    { $set: { "subscription.paymentStatus": "paid", "subscription.paymentId": razorpayPaymentId, "subscription.orderId": razorpayOrderId, "subscription.validFrom": now, "subscription.validUntil": validUntil, "subscription.graceUntil": graceUntil, updatedAt: now } }
  );

  return NextResponse.json({ ok: true, status: "paid" });
}
