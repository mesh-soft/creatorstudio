import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth, requireGemAuth, checkResellerOwnership } from "@/lib/token";
import { MIN_PRICE } from "@/lib/authStore";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let body: any;
  try { body = JSON.parse(rawBody); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { tenantId } = body;
  if (!tenantId) return NextResponse.json({ error: "tenantId required" }, { status: 400 });

  let auth = requireAuth(req, { adminOnly: true });
  if (!auth.ok) auth = requireAuth(req, { tenantId });
  if (!auth.ok) auth = await checkResellerOwnership(req, tenantId);
  if (!auth.ok && auth.response.status === 401) auth = requireGemAuth(req, rawBody);
  if (!auth.ok) return auth.response;

  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: tenantId });
  if (!user) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const amountPaise = Math.max(MIN_PRICE, (user.subscription?.amount ?? MIN_PRICE)) * 100;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
  }

  const receipt = `rcpt_${tenantId}_${Date.now().toString(36)}`;

  const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { tenantId },
    }),
  });

  if (!rpRes.ok) {
    const err = await rpRes.text();
    return NextResponse.json({ error: "Razorpay order creation failed", details: err }, { status: 500 });
  }

  const order = await rpRes.json();

  await db.collection("payments").insertOne({
    razorpayOrderId: order.id,
    tenantId,
    tenantType: user.tenantType ?? "doctor",
    resellerId: user.resellerId ?? null,
    commissionPercent: user.commissionPercent ?? 0,
    amount: order.amount,
    currency: "INR",
    receipt,
    plan: user.subscription?.plan ?? "monthly",
    durationDays: 30,
    graceDays: 15,
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    amount: order.amount,
    currency: "INR",
    key: keyId,
  });
}
