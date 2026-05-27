import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/token";
import { getAuthStore, MIN_PRICE } from "@/lib/authStore";
import { getContentAdapter } from "@/platform/contentAdapter";
import { wrapFlatSiteIntoSettings } from "@/platform/siteSettingsNormalize";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;
  if (auth.payload.role !== "reseller" && auth.payload.role !== "admin") {
    return NextResponse.json({ error: "Only resellers can create tenants" }, { status: 403 });
  }

  const body = await req.json();
  const { tenantId, username, password, name, specialty, plan, originalPrice, discountPercent, tenantType } = body;
  if (!tenantId || !username || !password || !name) {
    return NextResponse.json({ error: "tenantId, username, password, name required" }, { status: 400 });
  }

  const type = (tenantType || "doctor") as "doctor" | "hospital";
  const price = Math.max(MIN_PRICE, Math.round((originalPrice ?? 2999) * (1 - (discountPercent ?? 0) / 100)));

  const store = await getAuthStore();
  if (!store.setCredential || !store.updateUser) {
    return NextResponse.json({ error: "MongoDB backend required" }, { status: 503 });
  }

  // Hash password
  const { scryptSync, randomBytes } = await import("node:crypto");
  const salt = randomBytes(32).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");

  const now = new Date();
  const trialUntil = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const graceUntil = new Date(trialUntil.getTime() + 10 * 24 * 60 * 60 * 1000);

  await store.setCredential(tenantId, {
    username, hash, salt,
    role: "user",
    tenantType: type,
  });

  await store.updateUser(tenantId, {
    resellerId: auth.payload.tenantId,
    resellerCanEdit: true,
    commissionPercent: discountPercent ?? 0,
    subscription: {
      plan: plan ?? "monthly",
      validFrom: now.toISOString(),
      validUntil: trialUntil.toISOString(),
      graceUntil: graceUntil.toISOString(),
      paymentStatus: "pending",
      amount: price,
      originalPrice: originalPrice ?? 2999,
      discountPercent: discountPercent ?? 0,
    },
  } as any);

  // Create site JSON
  const baseDir = type === "doctor" ? "content/doctors" : "content/hospitals";
  const adapter = await getContentAdapter();

  const sitePayload = wrapFlatSiteIntoSettings({
    tenantId, tenantType: type, status: "active",
    subscription: {
      plan: plan ?? "monthly",
      billingCycle: "monthly",
      validFrom: now.toISOString(),
      validUntil: trialUntil.toISOString(),
      graceUntil: graceUntil.toISOString(),
      paymentStatus: "pending",
    },
    domains: { primary: "localhost:3000", aliases: [] },
    profile: {
      displayName: name,
      specialty: specialty ?? "General Practitioner",
      degrees: ["MBBS", "MD"],
      registrationNumber: "DMC-" + Math.floor(10000 + Math.random() * 90000),
      experienceYears: 15,
      bio: `${name} is a dedicated ${specialty ?? "general practitioner"} with 15+ years of experience.`,
      photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80",
    },
    business: {
      clinicName: `${name} Clinic`,
      phone: "+91 99999 99999",
      whatsapp: "+919999999999",
      email: `clinic@${tenantId}.com`,
      address: "123 Main Road, Near City Hospital, Delhi",
      mapUrl: "https://maps.google.com",
    },
    presentation: {
      themeId: "doctor-standard",
      variantPresetId: "doctor-classic",
      styleId: "doctor-teal-clean",
      style: {
        colors: { primary: "#0f766e", secondary: "#2563eb", accent: "#f59e0b", background: "#ffffff", surface: "#f8fafc", text: "#111827" },
        shape: { radius: "8px" },
        typography: { heading: "Inter, Arial, sans-serif", body: "Inter, Arial, sans-serif" },
      },
    },
    header: { show: true, navLinks: ["Services", "About", "Contact"] },
    footer: { show: true, copyright: `© ${now.getFullYear()} ${name}. All rights reserved.`, socialLinks: ["Facebook|#", "Twitter|#", "Instagram|#"] },
    seo: { title: `${name} — ${specialty ?? "General Practitioner"}`, description: `Book an appointment with ${name} at ${name} Clinic.` },
  });

  const homeData = {
    _template: "page",
    blocks: [
      { _template: "hero", enabled: true, headline: `Welcome to ${name} Clinic`, subheadline: `Expert care by ${specialty ?? "a general practitioner"} with 15+ years of experience.`, photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80", buttons: [{ label: "Book Appointment", url: "#contact" }] },
      { _template: "services", enabled: true, kicker: "Our Services", title: "Comprehensive Medical Care", items: [{ title: "General Consultation", description: "Complete health checkup and diagnosis." }, { title: "Follow-up Care", description: "Regular monitoring and medication management." }] },
      { _template: "footer", enabled: true, copyright: `© ${now.getFullYear()} ${name}. All rights reserved.` },
    ],
    settings: [
      { _template: "urlSettings", slug: "home", path: "/", title: "Home", isHome: true },
      { _template: "presentation", themeId: "doctor-standard", variantPresetId: "doctor-classic", styleId: "doctor-teal-clean" },
      { _template: "seo", title: `${name} — Home`, description: `Welcome to ${name}'s clinic.` },
    ],
  };

  await adapter.write(`${baseDir}/${tenantId}/site/index.json`, JSON.stringify(sitePayload, null, 2));
  await adapter.write(`${baseDir}/${tenantId}/pages/home.json`, JSON.stringify(homeData, null, 2));

  return NextResponse.json({
    ok: true,
    tenantId,
    price,
    trialUntil: trialUntil.toISOString(),
    graceUntil: graceUntil.toISOString(),
    paymentLink: `/site/${tenantId}/home?pay=1`,
  });
}
