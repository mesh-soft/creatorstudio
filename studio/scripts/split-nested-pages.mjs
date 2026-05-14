import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.join(__dirname, "..", "content");

function splitTenantType(directoryName) {
  const directory = path.join(contentRoot, directoryName);
  if (!fs.existsSync(directory)) return;

  for (const tenantSlug of fs.readdirSync(directory)) {
    const tenantDirectory = path.join(directory, tenantSlug);
    if (!fs.statSync(tenantDirectory).isDirectory()) continue;
    splitTenant(tenantDirectory, tenantSlug);
  }
}

function splitTenant(tenantDirectory, tenantSlug) {
  const siteFile = path.join(tenantDirectory, "site", "index.json");
  if (!fs.existsSync(siteFile)) {
    console.log(`${tenantSlug}: missing site/index.json, skipping`);
    return;
  }

  const site = JSON.parse(fs.readFileSync(siteFile, "utf8"));
  const pages = Array.isArray(site.pages) ? site.pages : [];
  const pagesDirectory = path.join(tenantDirectory, "pages");
  fs.mkdirSync(pagesDirectory, { recursive: true });

  const pagesToWrite = pages.length > 0 ? pages : [createHomePage()];
  for (const page of pagesToWrite) {
    const slug = sanitizeSlug(page.slug || (page.isHome ? "home" : page.title) || "home");
    const pageFile = path.join(pagesDirectory, `${slug}.json`);
    fs.writeFileSync(pageFile, JSON.stringify({ ...page, slug }, null, 2));
  }

  delete site.pages;
  fs.writeFileSync(siteFile, JSON.stringify(site, null, 2));
  console.log(`${tenantSlug}: wrote ${pagesToWrite.length} page file(s)`);
}

function sanitizeSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "home";
}

function createHomePage() {
  return {
    slug: "home",
    title: "Home",
    path: "/",
    isHome: true,
    content: {
      headline: "",
      subheadline: "",
      copy: {},
      services: [],
      timings: [],
      gallery: [],
      faqs: [],
      testimonials: [],
      stats: [],
      blocks: [
        { _template: "hero", enabled: true },
        { _template: "profile", enabled: true },
        { _template: "services", enabled: true },
        { _template: "timings", enabled: true },
        { _template: "gallery", enabled: true },
        { _template: "faq", enabled: true },
        { _template: "cta", enabled: true }
      ]
    }
  };
}

splitTenantType("doctors");
splitTenantType("hospitals");
