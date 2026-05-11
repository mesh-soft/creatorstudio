import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { type, name, slug } = await request.json();
    
    if (!type || !name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: type, name, slug" },
        { status: 400 }
      );
    }

    const baseDir = type === "doctor" ? "content/doctors" : "content/hospitals";
    const tenantPath = path.join(process.cwd(), baseDir, slug);
    
    // Create folder structure
    await fs.mkdir(path.join(tenantPath, "site"), { recursive: true });
    await fs.mkdir(path.join(tenantPath, "pages"), { recursive: true });
    
    // Default site/index.json
    const siteData = {
      _template: "site",
      name: name,
      specialty: type === "doctor" ? "General Practitioner" : "Multi-Specialty",
      catchphrase: `Welcome to ${name}`,
      description: `${name} provides excellent healthcare services.`,
      contact: {
        phone: "",
        email: "",
        address: "",
      },
      social: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
      },
      seo: {
        title: name,
        description: `${name} - Healthcare Services`,
        keywords: [type, "healthcare", "medical"],
      },
    };
    
    // Default pages/home.json
    const homeData = {
      _template: "page",
      title: "Home",
      slug: "home",
      meta: {
        title: `Home - ${name}`,
        description: `Welcome to ${name}`,
      },
      sections: [],
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
