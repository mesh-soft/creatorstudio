import { NextRequest, NextResponse } from "next/server";
import { wrapFlatSiteIntoSettings } from "@/platform/siteSettingsNormalize";
import { getContentAdapter } from "@/platform/contentAdapter";
import { requireAuth } from "@/lib/token";
import { TENANT_ID_RE } from "@/lib/importValidator";

export async function POST(request: NextRequest) {
  // Only admin tokens may create new tenants
  const auth = requireAuth(request, { adminOnly: true });
  if (!auth.ok) return auth.response;

  try {
    const { type, name, slug, plan = "free", overrides = {} } = await request.json();

    if (!type || !name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: type, name, slug" },
        { status: 400 },
      );
    }

    if (type !== "doctor" && type !== "hospital") {
      return NextResponse.json(
        { error: 'type must be "doctor" or "hospital"' },
        { status: 400 },
      );
    }

    if (!TENANT_ID_RE.test(slug)) {
      return NextResponse.json(
        { error: "slug must be kebab-case: lowercase letters, numbers, hyphens, underscores; must start and end with a letter or digit; max 50 characters" },
        { status: 400 },
      );
    }

    const baseDir = type === "doctor" ? "content/doctors" : "content/hospitals";

    const validUntil  = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const validFrom   = new Date().toISOString().split("T")[0];
    const graceUntil  = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const siteData = type === "doctor" ? {
      _template: "site",
      tenantId: slug,
      tenantType: "doctor",
      status: "active",
      subscription: {
        plan: plan === "free" ? "doctor_starter" : plan,
        billingCycle: "yearly",
        validFrom,
        validUntil,
        graceUntil,
        paymentStatus: "paid",
      },
      domains: { primary: "localhost:3000", aliases: [] },
      profile: {
        displayName: name,
        specialty:          overrides.specialty          ?? "General Practitioner",
        degrees:            overrides.degrees            ?? ["MBBS", "MD"],
        registrationNumber: "DMC-" + Math.floor(10000 + Math.random() * 90000),
        experienceYears:    overrides.experienceYears    ?? 15,
        bio: `${name} is a dedicated ${overrides.specialty ?? "general practitioner"} with ${overrides.experienceYears ?? 15}+ years of experience.`,
        photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80",
      },
      business: {
        clinicName: overrides.clinicName ?? `${name} Clinic`,
        phone:      overrides.phone      ?? "+91 99999 99999",
        whatsapp:   overrides.whatsapp   ?? "+919999999999",
        email:      overrides.email      ?? `clinic@${slug}.com`,
        address:    overrides.address    ?? "123 Main Road, Near City Hospital, Delhi",
        mapUrl: "https://maps.google.com",
      },
      presentation: {
        themeId: "doctor-standard",
        variantPresetId: "doctor-classic",
        styleId: overrides.styleId ?? "doctor-teal-clean",
        style: {
          colors: { primary: "#0f766e", secondary: "#2563eb", accent: "#f59e0b", background: "#ffffff", surface: "#f8fafc", text: "#111827" },
          shape: { radius: "8px" },
          typography: { heading: "Inter, Arial, sans-serif", body: "Inter, Arial, sans-serif" },
        },
      },
      header: { show: true, navLinks: ["Services", "About", "Contact"] },
      seo: {
        title: `${name} | General Practitioner`,
        description: `Book appointments with ${name}, experienced general practitioner.`,
        keywords: ["general practitioner", "doctor", "healthcare", "medical"],
        ogImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
      },
    } : {
      _template: "site",
      tenantId: slug,
      tenantType: "hospital",
      status: "active",
      subscription: {
        plan: plan === "free" ? "hospital_starter" : plan,
        billingCycle: "yearly",
        validFrom,
        validUntil,
        graceUntil,
        paymentStatus: "paid",
      },
      domains: { primary: "localhost:3000", aliases: [] },
      profile: {
        displayName: name,
        tagline: "Excellence in Healthcare",
        bio: `${name} is a leading multi-specialty hospital providing comprehensive healthcare services.`,
        image: "https://images.unsplash.com/photo-1587351021759-3e566b1afbb2?auto=format&fit=crop&w=900&q=80",
      },
      business: {
        phone:       overrides.phone       ?? "+91 88888 88888",
        whatsapp:    overrides.whatsapp    ?? "+918888888888",
        email:       overrides.email       ?? `info@${slug}.com`,
        address:     overrides.address     ?? "456 Hospital Road, Medical City, Mumbai",
        mapUrl: "https://maps.google.com",
        established: overrides.established ?? "2005",
        beds:        overrides.beds        ?? "200+ beds",
        staff: "150+ medical professionals",
      },
      presentation: {
        themeId: "hospital-standard",
        variantPresetId: "hospital-standard",
        styleId: overrides.styleId ?? "hospital-blue-modern",
        style: {
          colors: { primary: "#1e40af", secondary: "#3b82f6", accent: "#10b981", background: "#ffffff", surface: "#f1f5f9", text: "#1e293b" },
          shape: { radius: "12px" },
          typography: { heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
        },
      },
      header: { show: true, navLinks: ["Services", "About", "Contact"] },
      seo: {
        title: `${name} | Multi-Specialty Hospital`,
        description: `${name} provides world-class healthcare services with experienced specialists.`,
        keywords: ["hospital", "multi-specialty", "healthcare", "medical", "emergency"],
        ogImage: "https://images.unsplash.com/photo-1587351021759-3e566b1afbb2?auto=format&fit=crop&w=1200&q=80",
      },
    };

    const sitePayload = wrapFlatSiteIntoSettings(siteData as Record<string, unknown>);

    const homeData = {
      _template: "page",
      slug: "home",
      title: "Home",
      path: "/",
      isHome: true,
      blocks: type === "doctor"
        ? [
            { _template: "hero",      enabled: true, headline: "Quality healthcare you can trust", subheadline: "Personalized medical care with compassion and expertise.", css: "" },
            { _template: "services",  enabled: true, kicker: "Services", title: "What we offer", items: [], css: "" },
            { _template: "timings",   enabled: true, kicker: "Timings", title: "Clinic hours", items: [], css: "" },
            { _template: "cta",       enabled: true, title: "Ready to book?", body: "Call or WhatsApp the clinic.", buttons: [], css: "" },
          ]
        : [
            { _template: "hero",        enabled: true, headline: "World-class healthcare for everyone", subheadline: "Advanced medical technology with compassionate care.", css: "" },
            { _template: "services",    enabled: true, kicker: "Departments", title: "Our Specialties", items: [], css: "" },
            { _template: "timings",     enabled: true, kicker: "Visiting Hours", title: "Hospital Timings", items: [], css: "" },
            { _template: "testimonials",enabled: true, kicker: "Reviews", title: "What patients say", items: [], css: "" },
            { _template: "cta",         enabled: true, title: "Need Emergency Care?", body: "Our 24/7 emergency department is always ready.", buttons: [], css: "" },
          ],
      settings: [
        { _template: "urlSettings", slug: "home", title: "Home", path: "/", isHome: true },
        { _template: "presentation", themeId: "", variantPresetId: "", styleId: "" },
        { _template: "seo", title: "", description: "", keywords: [] },
      ],
    };

    const adapter = await getContentAdapter();
    await adapter.write(`${baseDir}/${slug}/site/index.json`, JSON.stringify(sitePayload, null, 2));
    await adapter.write(`${baseDir}/${slug}/pages/home.json`,  JSON.stringify(homeData,    null, 2));

    return NextResponse.json({
      success: true,
      message: `Created ${type} tenant: ${slug}`,
      paths: [`${baseDir}/${slug}/site/index.json`, `${baseDir}/${slug}/pages/home.json`],
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json({ error: "Failed to create tenant", details: String(error) }, { status: 500 });
  }
}
