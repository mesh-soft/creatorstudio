import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthStore } from "@/lib/authStore";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (!tenantId) return NextResponse.json({ error: "tenantId required" }, { status: 400 });

  const store = await getAuthStore();
  const user = store.getUser ? await store.getUser(tenantId) : null;

  let latestPayment = null;
  try {
    const db = await getDb();
    latestPayment = await db.collection("payments").findOne(
      { tenantId },
      { sort: { createdAt: -1 } }
    );
  } catch {}

  return NextResponse.json({
    tenantId,
    subscription: user?.subscription ?? null,
    latestPayment: latestPayment ? {
      razorpayOrderId: latestPayment.razorpayOrderId,
      status: latestPayment.status,
      amount: latestPayment.amount,
      createdAt: latestPayment.createdAt,
      paidAt: latestPayment.paidAt,
    } : null,
  });
}
