import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { type, name, slug, plan = "free" } = await request.json();
    
    if (!type || !name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: type, name, slug" },
        { status: 400 }
      );
    }

    const baseDir = type === "doctor" ? "content/doctors" : "content/hospitals";
    const tenantPath = path.join(process.cwd(), baseDir, slug);
    
    // Create content folder structure
    await fs.mkdir(path.join(tenantPath, "site"), { recursive: true });
    await fs.mkdir(path.join(tenantPath, "pages"), { recursive: true });
    
    // Create media folder structure for uploads
    const mediaBaseDir = type === "doctor" ? "public/content/doctors" : "public/content/hospitals";
    const tenantMediaPath = path.join(process.cwd(), mediaBaseDir, slug);
    await fs.mkdir(tenantMediaPath, { recursive: true });
    
    // Default site/index.json with all required fields
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const validFrom = new Date().toISOString().split("T")[0];
    const graceUntil = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const siteData = type === "doctor" ? {
      // DOCTOR STRUCTURE
      _template: "site",
      tenantId: slug,
      tenantType: "doctor",
      status: "active",
      subscription: {
        plan: plan === "free" ? "doctor_starter" : plan,
        billingCycle: "yearly",
        validFrom: validFrom,
        validUntil: validUntil,
        graceUntil: graceUntil,
        paymentStatus: "paid",
      },
      domains: {
        primary: "localhost:3000",
        aliases: [],
      },
      profile: {
        displayName: name,
        specialty: "General Practitioner",
        degrees: ["MBBS", "MD"],
        registrationNumber: "DMC-" + Math.floor(10000 + Math.random() * 90000),
        experienceYears: 15,
        bio: name + " is a dedicated general practitioner with 15+ years of experience in preventive care, diagnosis, and treatment of common medical conditions.",
        photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80",
      },
      business: {
        clinicName: name + " Clinic",
        phone: "+91 99999 99999",
        whatsapp: "+919999999999",
        email: "clinic@" + slug + ".com",
        address: "123 Main Road, Near City Hospital, Delhi",
        mapUrl: "https://maps.google.com",
      },
      presentation: {
        themeId: "doctor-standard",
        variantPresetId: "doctor-classic",
        styleId: "doctor-teal-clean",
        style: {
          colors: {
            primary: "#0f766e",
            secondary: "#2563eb",
            accent: "#f59e0b",
            background: "#ffffff",
            surface: "#f8fafc",
            text: "#111827",
          },
          shape: {
            radius: "8px",
          },
          typography: {
            heading: "Inter, Arial, sans-serif",
            body: "Inter, Arial, sans-serif",
          },
        },
      },
      seo: {
        title: name + " | General Practitioner",
        description: "Book appointments with " + name + ", experienced general practitioner providing quality healthcare services.",
        keywords: ["general practitioner", "doctor", "healthcare", "medical"],
        ogImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
      },
    } : {
      // HOSPITAL STRUCTURE
      _template: "site",
      tenantId: slug,
      tenantType: "hospital",
      status: "active",
      subscription: {
        plan: plan === "free" ? "hospital_starter" : plan,
        billingCycle: "yearly",
        validFrom: validFrom,
        validUntil: validUntil,
        graceUntil: graceUntil,
        paymentStatus: "paid",
      },
      domains: {
        primary: "localhost:3000",
        aliases: [],
      },
      profile: {
        displayName: name,
        tagline: "Excellence in Healthcare",
        bio: name + " is a leading multi-specialty hospital providing comprehensive healthcare services with state-of-the-art facilities and experienced medical professionals.",
        image: "https://images.unsplash.com/photo-1587351021759-3e566b1afbb2?auto=format&fit=crop&w=900&q=80",
      },
      business: {
        phone: "+91 88888 88888",
        whatsapp: "+918888888888",
        email: "info@" + slug + ".com",
        address: "456 Hospital Road, Medical City, Mumbai",
        mapUrl: "https://maps.google.com",
        established: "2005",
        beds: "200+ beds",
        staff: "150+ medical professionals",
      },
      presentation: {
        themeId: "hospital-modern",
        variantPresetId: "hospital-premium",
        styleId: "hospital-blue-professional",
        style: {
          colors: {
            primary: "#1e40af",
            secondary: "#3b82f6",
            accent: "#10b981",
            background: "#ffffff",
            surface: "#f1f5f9",
            text: "#1e293b",
          },
          shape: {
            radius: "12px",
          },
          typography: {
            heading: "Inter, system-ui, sans-serif",
            body: "Inter, system-ui, sans-serif",
          },
        },
      },
      seo: {
        title: name + " | Multi-Specialty Hospital",
        description: name + " provides world-class healthcare services with experienced specialists and advanced medical technology.",
        keywords: ["hospital", "multi-specialty", "healthcare", "medical", "emergency"],
        ogImage: "https://images.unsplash.com/photo-1587351021759-3e566b1afbb2?auto=format&fit=crop&w=1200&q=80",
      },
    };
    
    // Default pages/home.json with type-specific structure
    const homeData = type === "doctor" ? {
      // DOCTOR HOME PAGE
      _template: "page",
      slug: "home",
      title: "Home",
      path: "/",
      isHome: true,
      content: {
        headline: "Quality healthcare you can trust",
        subheadline: "Personalized medical care with compassion and expertise for you and your family.",
        copy: {
          servicesKicker: "Services",
          servicesTitle: "What patients can book",
          timingsKicker: "Timings",
          timingsTitle: "Clinic availability",
          galleryKicker: "Gallery",
          galleryTitle: "Clinic photos",
          faqKicker: "FAQ",
          faqTitle: "Common patient questions",
          ctaTitle: "Ready to book?",
          ctaBody: "Call or WhatsApp the clinic.",
          whatsappLabel: "WhatsApp",
          callLabel: "Call",
        },
        services: [
          { title: "General Consultation", description: "Comprehensive health assessment and treatment planning.", icon: "stethoscope" },
          { title: "Health Checkup", description: "Preventive health screenings and wellness packages.", icon: "heart-pulse" },
          { title: "Vaccination", description: "Immunization services for all age groups.", icon: "syringe" },
          { title: "Minor Procedures", description: "Quick outpatient procedures and wound care.", icon: "bandage" },
        ],
        timings: [
          { day: "Monday", primary: "10 AM - 2 PM", secondary: "5 PM - 8 PM" },
          { day: "Tuesday", primary: "10 AM - 2 PM", secondary: "Closed" },
          { day: "Wednesday", primary: "10 AM - 2 PM", secondary: "5 PM - 8 PM" },
          { day: "Thursday", primary: "10 AM - 2 PM", secondary: "Closed" },
          { day: "Friday", primary: "10 AM - 2 PM", secondary: "5 PM - 8 PM" },
          { day: "Saturday", primary: "10 AM - 1 PM", secondary: "By appointment" },
          { day: "Sunday", primary: "Closed", secondary: "Closed" },
        ],
        gallery: [
          { src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80", alt: "Clinic reception", caption: "Welcoming reception area" },
          { src: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=900&q=80", alt: "Examination room", caption: "Modern examination room" },
          { src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80", alt: "Medical equipment", caption: "Advanced diagnostic equipment" },
        ],
        testimonials: [
          { name: "Rahul Sharma", role: "Patient", quote: "Dr. " + name + " is very patient and explains everything clearly. Highly recommended!", rating: 5 },
          { name: "Priya Patel", role: "Patient", quote: "Best doctor in the area. The clinic is clean and the staff is very helpful.", rating: 5 },
          { name: "Anita Gupta", role: "Patient", quote: "Got my vaccination done here. Quick and professional service.", rating: 4 },
        ],
        faq: [
          { question: "Do I need an appointment?", answer: "Walk-ins are welcome, but appointments are recommended to avoid waiting." },
          { question: "What payment methods do you accept?", answer: "We accept cash, cards, UPI, and major insurance plans." },
          { question: "How long is a typical consultation?", answer: "Initial consultations take 15-20 minutes. Follow-ups are usually 10 minutes." },
          { question: "Do you provide home visits?", answer: "Home visits are available for elderly patients and emergencies within 5km radius." },
        ],
        stats: [
          { label: "Years Experience", value: "15+" },
          { label: "Happy Patients", value: "5,000+" },
          { label: "Consultations", value: "10,000+" },
        ],
      },
      blocks: [
        { _template: "hero", variant: "doctor-hero", headline: "Quality healthcare you can trust", subheadline: "Personalized medical care with compassion and expertise." },
        { _template: "services", variant: "doctor-services" },
        { _template: "timings", variant: "doctor-timings" },
        { _template: "cta", variant: "doctor-cta" },
      ],
    } : {
      // HOSPITAL HOME PAGE
      _template: "page",
      slug: "home",
      title: "Home",
      path: "/",
      isHome: true,
      content: {
        headline: "World-class healthcare for everyone",
        subheadline: "Advanced medical technology combined with compassionate care from our expert team of specialists.",
        copy: {
          servicesKicker: "Departments",
          servicesTitle: "Our Specialties",
          timingsKicker: "Visiting Hours",
          timingsTitle: "Hospital Timings",
          galleryKicker: "Facilities",
          galleryTitle: "Our Infrastructure",
          faqKicker: "FAQ",
          faqTitle: "Common Questions",
          ctaTitle: "Need Emergency Care?",
          ctaBody: "Our 24/7 emergency department is always ready.",
          whatsappLabel: "Emergency Helpline",
          callLabel: "Call Now",
        },
        services: [
          { title: "Cardiology", description: "Comprehensive heart care including diagnostics, interventions, and rehabilitation.", icon: "heart" },
          { title: "Orthopedics", description: "Bone and joint care with advanced surgery and physiotherapy facilities.", icon: "bone" },
          { title: "Neurology", description: "Brain and nervous system care with modern imaging and surgical capabilities.", icon: "brain" },
          { title: "Pediatrics", description: "Specialized healthcare for infants, children, and adolescents.", icon: "baby" },
          { title: "Oncology", description: "Cancer care with chemotherapy, radiation, and supportive services.", icon: "ribbon" },
          { title: "Emergency", description: "24/7 emergency services with trauma care and ambulance support.", icon: "siren" },
        ],
        timings: [
          { day: "OPD Hours", primary: "8 AM - 8 PM", secondary: "All days" },
          { day: "Emergency", primary: "24/7", secondary: "Always open" },
          { day: "Visiting Hours", primary: "11 AM - 1 PM", secondary: "4 PM - 6 PM" },
          { day: "Pharmacy", primary: "24/7", secondary: "Always open" },
        ],
        gallery: [
          { src: "https://images.unsplash.com/photo-1587351021759-3e566b1afbb2?auto=format&fit=crop&w=900&q=80", alt: "Hospital building", caption: "Main hospital building" },
          { src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80", alt: "ICU", caption: "State-of-the-art ICU" },
          { src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80", alt: "Patient room", caption: "Comfortable patient rooms" },
          { src: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=900&q=80", alt: "Operation theater", caption: "Modern operation theaters" },
        ],
        testimonials: [
          { name: "Suresh Kumar", role: "Patient", quote: "Excellent care during my surgery. The doctors and nurses were very supportive throughout.", rating: 5 },
          { name: "Meena Devi", role: "Patient", quote: "Best hospital experience. Clean facilities, prompt service, and caring staff.", rating: 5 },
          { name: "Rajesh Gupta", role: "Patient", quote: "My father received excellent cardiac care here. Forever grateful to the team.", rating: 5 },
          { name: "Sunita Sharma", role: "Visitor", quote: "Good facilities and helpful staff. The cafeteria food is also quite good.", rating: 4 },
        ],
        faq: [
          { question: "How do I book an appointment?", answer: "Appointments can be booked online, via phone, or at our reception desk." },
          { question: "Do you have cashless insurance?", answer: "Yes, we have tie-ups with all major insurance providers for cashless treatment." },
          { question: "Is parking available?", answer: "Yes, we have multi-level parking for patients and visitors. Valet service available." },
          { question: "Do you have ambulance services?", answer: "Yes, 24/7 ambulance service with advanced life support. Call our emergency number." },
        ],
        stats: [
          { label: "Years of Service", value: "20+" },
          { label: "Beds", value: "200+" },
          { label: "Specialists", value: "50+" },
          { label: "Patients Treated", value: "100,000+" },
        ],
      },
      blocks: [
        { _template: "hero", variant: "hospital-hero", headline: "World-class healthcare for everyone", subheadline: "Advanced medical technology with compassionate care." },
        { _template: "services", variant: "hospital-departments" },
        { _template: "timings", variant: "hospital-hours" },
        { _template: "testimonials", variant: "hospital-reviews" },
        { _template: "cta", variant: "hospital-emergency" },
      ],
    };
    
    // Write files
    await fs.writeFile(
      path.join(tenantPath, "site", "index.json"),
      JSON.stringify(siteData, null, 2)
    );
    
    await fs.writeFile(
      path.join(tenantPath, "pages", "home.json"),
      JSON.stringify(homeData, null, 2)
    );
    
    return NextResponse.json({
      success: true,
      message: `Created ${type} tenant: ${slug}`,
      paths: [
        `${baseDir}/${slug}/site/index.json`,
        `${baseDir}/${slug}/pages/home.json`,
      ],
    });
    
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Failed to create tenant", details: String(error) },
      { status: 500 }
    );
  }
}
