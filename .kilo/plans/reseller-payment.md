# Reseller + Payment System — Unified Implementation Plan

## Current State
- `src/lib/authStore/` has `FileAuthStore` and `MongoAuthStore` with basic `credential` CRUD
- Login route uses `getAuthStore().getCredentials()` for verification
- `scripts/set-credentials.mjs` supports both file and mongo backends
- Login page redirect loop fixed, middleware gates `/site/*` routes

## Requirements

### Reseller
1. 3 user types: `admin`, `user` (tenant), `reseller` (with `commissionPercent`)
2. Reseller-tenant mapping via `resellerId` on user docs
3. Reseller can edit any managed tenant's site (default: `resellerCanEdit: true`)
4. Reseller can create new sites: 5-day trial + 10-day grace, payment pending
5. Reseller sets prices/discounts, gets payment link for tenant

### Payment
6. Tenant sees "Pay ₹X" banner with Razorpay checkout
7. Payment webhook (idempotent) — Razorpay → our server → update subscription
8. Frontend verify as fallback if webhook fails
9. Payment pending → check status on every page load
10. Migration script: existing JSON users → MongoDB

---

## MongoDB Collections

### `users` — credential + user profile + subscription

```json
{
  "_id": "dr-smith",
  "username": "admin",
  "hash": "<scrypt hex>",
  "salt": "<random hex>",
  "role": "user",
  "tenantType": "doctor",
  "resellerId": "reseller1",
  "resellerCanEdit": true,
  "commissionPercent": null,
  "subscription": {
    "plan": "monthly",
    "validFrom": "2026-05-27T...",
    "validUntil": "2026-06-26T...",
    "graceUntil": "2026-07-11T...",
    "paymentStatus": "pending",
    "amount": 1999,
    "originalPrice": 2999,
    "discountPercent": 33,
    "paymentId": null,
    "orderId": null
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

Indexes: `{ resellerId: 1 }`, `{ role: 1 }`

### `payments` — payment records (audit + idempotency)

```json
{
  "_id": ObjectId,
  "razorpayOrderId": "order_abc123",
  "tenantId": "dr-smith",
  "tenantType": "doctor",
  "resellerId": "reseller1",
  "commissionPercent": 15,
  "amount": 199900,
  "currency": "INR",
  "receipt": "rcpt_dr-smith_1716...",
  "plan": "monthly",
  "durationDays": 30,
  "graceDays": 15,
  "status": "paid",
  "razorpayPaymentId": "pay_xyz",
  "validFrom": "2026-05-27T...",
  "validUntil": "2026-06-26T...",
  "graceUntil": "2026-07-11T...",
  "createdAt": "...",
  "paidAt": "...",
  "updatedAt": "..."
}
```

Unique index: `{ razorpayOrderId: 1, tenantId: 1 }`  ← **idempotency gate**

### `webhooks_raw` — raw webhook archive (never modified, never pruned)

```json
{
  "_id": "evt_abc123",
  "receivedAt": "2026-05-27T18:48:04.000Z",
  "headers": { "x-razorpay-event-id": "evt_abc123", "x-razorpay-signature": "..." },
  "body": { "event": "payment.captured", "payload": { ... } }
}
```

---

## Files to create (12 files)

### Foundation
| File | Purpose |
|------|---------|
| `src/lib/db.ts` | MongoDB connection singleton (`getDb()`) |

### Auth store update  
| File | Change |
|------|--------|
| `src/lib/authStore/index.ts` | Add `UserDoc` interface, `getUser`/`listUsers`/`updateUser` to `MongoAuthStore`, export `MIN_PRICE = 999` |

### Payment APIs (4 routes)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/payment/create` | POST | Create Razorpay order → insert payment record → return `{ orderId, amount, key }` |
| `/api/payment/webhook` | POST | Razorpay webhook: verify HMAC, save raw to `webhooks_raw`, idempotent update `payments` + `users` |
| `/api/payment/verify` | POST | Frontend fallback: verify signature, same idempotent logic as webhook |
| `/api/payment/status` | GET | `?tenantId=x` → return subscription + latest payment |

### User APIs (1 route)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/users` | GET/POST | List users (filter by role/resellerId), create user |
| `/api/users/create-tenant` | POST | Reseller creates new tenant with trial + pricing |
| `/api/users/[tenantId]` | GET/PATCH/DELETE | Single user CRUD |

### Frontend (3 components)
| File | Purpose |
|------|---------|
| `src/components/payment/PayBanner.tsx` | "Pay ₹X" banner → Razorpay checkout → verify |
| `src/components/payment/PaymentStatusCheck.tsx` | On mount: if pending → check status → update or show banner |
| `src/app/reseller/page.tsx` | Reseller dashboard — managed tenants list |

### Migration
| File | Purpose |
|------|---------|
| `scripts/migrate-users-to-mongo.mjs` | Read `credentials.json` → upsert into MongoDB `users` collection |

### Config updates
| File | Change |
|------|--------|
| `src/app/login/page.tsx` | Read `?redirect=`, redirect reseller → `/reseller`, user pending → `/site/{id}/home?pay=1` |
| `src/app/api/auth/login/route.ts` | Response includes `role`, `subscription`, `resellerId`, `commissionPercent` |
| `src/middleware.ts` | Allow `/api/payment/*` without auth; gate `/reseller/*` (admin+reseller only) |
| `scripts/set-credentials.mjs` | Support `--role=reseller`, `--commission=15` flags |

---

## Core Implementation: Webhook Idempotency

```
POST /api/payment/webhook
│
├─ 1. Read raw body as text
├─ 2. Verify HMAC: createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
│     .update(rawBody).digest("hex") === x-razorpay-signature
│
├─ 3. Save raw webhook to "webhooks_raw" collection
│     db.collection("webhooks_raw").updateOne(
│       { _id: eventId },
│       { $setOnInsert: { receivedAt, headers, body: JSON.parse(rawBody) } },
│       { upsert: true }
│     )
│     → Always saved as-is, never modified. Full audit trail.
│
├─ 4. Parse event. If not "payment.captured" → 200 with note.
│     Extract: orderId, paymentId, tenantId (from notes)
│
├─ 5. Idempotent payment update:
│     db.collection("payments").findOneAndUpdate(
│       {
│         razorpayOrderId: orderId,
│         tenantId: tenantId,
│         status: { $ne: "paid" }     ← SKIP if already paid
│       },
│       {
│         $set: {
│           status: "paid",
│           razorpayPaymentId: paymentId,
│           paidAt: now,
│           validFrom: now,
│           validUntil: now + 30d,
│           graceUntil: now + 45d,
│         }
│       },
│       { returnDocument: "after" }
│     )
│     → If null (already paid): return 200 "already processed"
│     → If updated: proceed to step 6
│
└─ 6. Update user subscription:
      db.collection("users").updateOne(
        { _id: tenantId },
        {
          $set: {
            "subscription.paymentStatus": "paid",
            "subscription.paymentId": paymentId,
            "subscription.orderId": orderId,
            "subscription.validFrom": validFrom,
            "subscription.validUntil": validUntil,
            "subscription.graceUntil": graceUntil,
          }
        }
      )
```

The `status: { $ne: "paid" }` filter in `findOneAndUpdate` ensures 100 webhook deliveries = 1 update only.

---

## Core Implementation: Payment Create (Razorpay Order)

```
POST /api/payment/create { tenantId }
│
├─ Auth: requireAuth (admin or reseller managing this tenant)
├─ Get user doc to read subscription.amount (or use MIN_PRICE)
├─ Create Razorpay order:
│   POST https://api.razorpay.com/v1/orders
│   Auth: Basic base64(RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET)
│   Body: { amount: 199900 (paise), currency: "INR", receipt: "rcpt_dr-smith_<ts>", notes: { tenantId } }
│
├─ Insert payment record:
│   db.collection("payments").insertOne({
│     razorpayOrderId: order.id,
│     tenantId, resellerId, commissionPercent,
│     amount: order.amount, currency: "INR", receipt,
│     plan: "monthly", durationDays: 30, graceDays: 15,
│     status: "created",
│     createdAt: now, updatedAt: now
│   })
│
└─ Return: { ok: true, orderId, amount, currency, key: RAZORPAY_KEY_ID }
```

---

## Reseller Tenant Creation

```
POST /api/users/create-tenant
Body: { tenantId, username, password, name, specialty, plan, originalPrice, discountPercent, tenantType }
│
├─ Auth: reseller only (from JWT)
├─ Calculate: amount = max(MIN_PRICE, originalPrice * (1 - discountPercent/100))
├─ Compute: trialUntil = now + 5d, graceUntil = trialUntil + 10d
│
├─ Create user in MongoDB:
│   { _id: tenantId, username, hash, salt, role: "user", tenantType,
│     resellerId: <current reseller>, resellerCanEdit: true,
│     subscription: {
│       plan, validFrom: now, validUntil: trialUntil, graceUntil,
│       paymentStatus: "pending",
│       amount, originalPrice, discountPercent
│     }
│   }
│
├─ Create site JSON (call create-tenant API logic internally):
│   adapter.write("content/doctors/{tenantId}/site/index.json", sitePayload)
│   adapter.write("content/doctors/{tenantId}/pages/home.json", pagePayload)
│
├─ Create payment order:
│   POST /api/payment/create (internal) → returns { orderId, amount }
│
└─ Return: { tenantId, orderId, amount, paymentLink: `/site/${tenantId}/home?pay=1` }
```

---

## Login Flow Update

```
POST /api/auth/login
│
├─ Verify password (unchanged)
├─ Get full user doc from authStore.getUser(tenantId)
│
├─ If role === "reseller":
│   → Response includes: { role: "reseller", commissionPercent, redirect: "/reseller" }
│
├─ If role === "user" && subscription.paymentStatus === "pending":
│   → Response includes: { role: "user", subscription, redirect: "/site/{tenantId}/home?pay=1" }
│
└─ If role === "user" && subscription.paymentStatus === "paid":
    → Response includes: { role: "user", redirect: "/site/{tenantId}/home" }
```

Frontend (`login/page.tsx`):
- Read `data.redirect` from login response
- `window.location.replace(data.redirect)` after setting token

---

## Migration Script

```bash
MONGODB_URI=mongodb://... node scripts/migrate-users-to-mongo.mjs
```

```javascript
// 1. Read data/credentials.json
// 2. For each entry:
//    - Connect to MongoDB
//    - Upsert into "users" collection
//    - Set role: "__admin__" → "admin", others → "user" (or read from flag file)
//    - If user has existing content, set siteCreated: true
// 3. Print summary: N users migrated
```

---

## Env vars

```
MONGODB_URI=mongodb+srv://...
AUTH_BACKEND=mongo
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Verification Flow (end-to-end)

1. **Setup**: `AUTH_BACKEND=mongo`, run migration script
2. **Create reseller**: `node scripts/set-credentials.mjs reseller1 admin pass --role=reseller --commission=15`
3. **Reseller login**: goes to `/reseller` dashboard
4. **Create tenant**: reseller creates "dr-test", ₹1999 (20% off ₹2499) → trial 5d + 10d grace
5. **Tenant visits**: `/site/dr-test/home?pay=1` → sees "Pay ₹1999" banner
6. **Pay**: Razorpay checkout → payment completes
7. **Webhook fires**: `POST /api/payment/webhook` → idempotent update → subscription = paid
8. **Tenant reloads**: sees normal site content, subscription valid 30 days
9. **Reseller dashboard**: shows "dr-test" as paid, commission earned = ₹299.85 (15% of ₹1999)
10. **Idempotency test**: re-fire webhook → returns "already processed"
