import { NextRequest, NextResponse } from "next/server";
import { scryptSync, randomBytes } from "node:crypto";
import { getAuthStore } from "@/lib/authStore";
import { getContentAdapter } from "@/platform/contentAdapter";
import { wrapFlatSiteIntoSettings } from "@/platform/siteSettingsNormalize";

const PASS_RE = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function generateTenantId(name: string, existing: Set<string>): string {
  let slug = name.toLowerCase().replace(/\bdr\.?\s*/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "").slice(0, 45);
  if (!slug.match(/^[a-z0-9]/)) slug = "dr-" + slug;
  if (existing.has(slug)) {
    for (let n = 1; n < 1000; n++) {
      const candidate = `${slug}-${n}`;
      if (!existing.has(candidate)) { slug = candidate; break; }
    }
  }
  existing.add(slug);
  return slug;
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, mobile, password, role = "user", tenantType = "doctor" } = body;
  if (!name || !email || !mobile || !password) {
    return NextResponse.json({ ok: false, error: "name, email, mobile, and password are required" }, { status: 400 });
  }

  if (!PASS_RE.test(password)) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters with 1 special character" }, { status: 400 });
  }

  const store = await getAuthStore();
  const existing = await store.getCredentials();

  // Uniqueness: check username field (email) across all credentials — works for both file + mongo
  for (const [tid, cred] of Object.entries(existing)) {
    if (cred.username === email) {
      return NextResponse.json({ ok: false, error: "An account with this email already exists" }, { status: 409 });
    }
  }

  // Uniqueness: check email + mobile in MongoDB extended fields
  if (store.getUser) {
    for (const [tid] of Object.entries(existing)) {
      const u = await store.getUser(tid);
      if (u?.email && u.email !== u.username && u.email === email) {
        return NextResponse.json({ ok: false, error: "An account with this email already exists" }, { status: 409 });
      }
      if (mobile && u?.mobile === mobile) {
        return NextResponse.json({ ok: false, error: "An account with this mobile number already exists" }, { status: 409 });
      }
    }
  }

  const existingIds = new Set(Object.keys(existing));
  const tenantId = generateTenantId(name, existingIds);

  const salt = randomBytes(32).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");

  if (role === "reseller") {
    await store.setCredential(tenantId, { username: email, hash, salt, role: "reseller", tenantType });
    if (store.updateUser) {
      await store.updateUser(tenantId, { commissionPercent: 15, resellerCanEdit: true, displayName: name, email, mobile } as any);
    }
    return NextResponse.json({ ok: true, tenantId, redirect: "/creator", message: "Reseller account created." });
  }

  // Normal user
  await store.setCredential(tenantId, { username: email, hash, salt, role: "user", tenantType });
  if (store.updateUser) {
    await store.updateUser(tenantId, { displayName: name, email, mobile } as any);
  }

  const now = new Date();
  const trialUntil = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const graceUntil = new Date(trialUntil.getTime() + 10 * 24 * 60 * 60 * 1000);

  if (store.updateUser) {
    await store.updateUser(tenantId, {
      subscription: { plan: "monthly", validFrom: now.toISOString(), validUntil: trialUntil.toISOString(), graceUntil: graceUntil.toISOString(), paymentStatus: "pending", amount: 999, originalPrice: 999, discountPercent: 0 },
    } as any);
  }

  const baseDir = tenantType === "doctor" ? "content/doctors" : "content/hospitals";
  const adapter = await getContentAdapter();

  const styleIds = ["doctor-teal-clean","doctor-premium-warm","doctor-bright-child","doctor-derma-minimal","doctor-slate-precision","hospital-blue-modern","hospital-green-trust","hospital-indigo-specialty","hospital-community-soft"];
  const variantIds = ["doctor-classic","doctor-editorial","doctor-compact","doctor-premium","doctor-specialist","hospital-standard","hospital-emergency","hospital-specialty","hospital-community"];
  const themeIds = ["doctor-standard","doctor-profile-heavy","doctor-service-heavy","hospital-standard","hospital-emergency-first"];
  const heroImages = [
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1587351021759-3e566b1afbb2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
  ];
  const profileImages = [
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
  ];

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const rStyle   = pick(styleIds.filter(s => s.startsWith(tenantType)));
  const rVariant = pick(variantIds.filter(v => v.startsWith(tenantType)));
  const rTheme   = pick(themeIds.filter(t => t.startsWith(tenantType)));
  const heroImg  = pick(heroImages);
  const profImg  = pick(profileImages);

  const sitePayload = wrapFlatSiteIntoSettings({
    tenantId, tenantType, status: "active",
    subscription: { plan: "monthly", billingCycle: "monthly", validFrom: now.toISOString(), validUntil: trialUntil.toISOString(), graceUntil: graceUntil.toISOString(), paymentStatus: "pending" },
    domains: { primary: "localhost:3000", aliases: [] },
    profile: { displayName: name, specialty: "Healthcare Professional", degrees: ["MBBS", "MD"], registrationNumber: "DMC-" + Math.floor(10000 + Math.random() * 90000), experienceYears: 15, bio: `${name} is a dedicated healthcare professional with 15+ years of experience.`, photo: profImg },
    business: { clinicName: `${name} Clinic`, phone: mobile, whatsapp: mobile.replace(/^\+?/,""), email, address: "123 Main Road, Near City Hospital, Delhi", mapUrl: "https://maps.google.com" },
    presentation: { themeId: rTheme, variantPresetId: rVariant, styleId: rStyle, style: { colors: { primary: "#0f766e", secondary: "#2563eb", accent: "#f59e0b", background: "#ffffff", surface: "#f8fafc", text: "#111827" }, shape: { radius: "8px" }, typography: { heading: "Inter, Arial, sans-serif", body: "Inter, Arial, sans-serif" } } },
    header: { show: true, navLinks: ["Services", "About", "Contact"] },
    footer: { show: true, copyright: `© ${now.getFullYear()} ${name}. All rights reserved.` },
    seo: { title: `${name} — Healthcare Professional`, description: `Book an appointment with ${name} at ${name} Clinic.` },
  });

  const homeData = {
    _template: "page",
    blocks: [
      { _template: "hero", enabled: true, headline: `Welcome to ${name} Clinic`, subheadline: `Expert healthcare with 15+ years of experience.`, photo: heroImg, buttons: [{ label: "Book Appointment", url: "#contact" }, { label: "Call Now", url: `tel:${mobile}` }] },
      { _template: "services", enabled: true, kicker: "Our Services", title: "Comprehensive Medical Care", items: [{ title: "General Consultation", description: "Complete health checkup and diagnosis." }, { title: "Follow-up Care", description: "Regular monitoring and medication management." }, { title: "Preventive Care", description: "Stay ahead with regular screenings and health assessments." }] },
      { _template: "cta", enabled: true, title: "Need Urgent Care?", body: "Schedule a priority appointment today. We're here to help you feel better, faster.", buttons: [{ label: "Book Now", url: "#contact", variant: "primary" }] },
      { _template: "testimonials", enabled: true, kicker: "Patient Stories", title: "What Our Patients Say", items: [{ quote: "Dr. ${name} is incredibly thorough. I've never felt more cared for by a medical professional. The follow-up care is outstanding.", author: "Rohit S." }, { quote: "I was able to get an appointment the same day. The clinic is clean, modern, and the staff is wonderful. Highly recommended!", author: "Priya M." }] },
      { _template: "location", enabled: true, kicker: "Visit Us", title: "Our Clinic", mapUrl: "https://maps.google.com", height: 400 },
      { _template: "whatsapp", enabled: true, phone: mobile.replace(/^\+?/,""), message: `Hi, I'd like to book an appointment at ${name} Clinic.`, label: "Chat with us" },
      { _template: "footer", enabled: true, copyright: `© ${now.getFullYear()} ${name}. All rights reserved.` },
    ],
    settings: [
      { _template: "urlSettings", slug: "home", path: "/", title: "Home", isHome: true },
      { _template: "presentation", themeId: rTheme, variantPresetId: rVariant, styleId: rStyle },
      { _template: "seo", title: `${name} — Home`, description: `Welcome to ${name}'s clinic.` },
    ],
  };

  await adapter.write(`${baseDir}/${tenantId}/site/index.json`, JSON.stringify(sitePayload, null, 2));
  await adapter.write(`${baseDir}/${tenantId}/pages/home.json`, JSON.stringify(homeData, null, 2));

  return NextResponse.json({
    ok: true, tenantId,
    redirect: `/creator/${tenantType}/${tenantId}?pay=1`,
    subscription: { amount: 999, paymentStatus: "pending" },
    message: "Account created. Your trial site is ready.",
  });
}
