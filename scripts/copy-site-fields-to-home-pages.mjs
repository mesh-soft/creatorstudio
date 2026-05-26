import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.join(__dirname, "..", "content");

const siteFieldNames = [
  "tenantId",
  "tenantType",
  "status",
  "subscription",
  "domains",
  "profile",
  "business",
  "presentation",
  "header",
  "seo",
];

function unwrapSiteSettings(site) {
  if (!Array.isArray(site.settings)) return site;
  const { settings, ...meta } = site;
  const out = { ...meta };
  for (const block of settings) {
    const t = block && block._template;
    if (typeof t !== "string") continue;
    const { _template, ...rest } = block;
    out[t] = rest;
  }
  return out;
}

for (const tenantTypeDirectory of ["doctors", "hospitals"]) {
  const directory = path.join(contentRoot, tenantTypeDirectory);
  if (!fs.existsSync(directory)) continue;

  for (const tenantSlug of fs.readdirSync(directory)) {
    const tenantDirectory = path.join(directory, tenantSlug);
    if (!fs.statSync(tenantDirectory).isDirectory()) continue;

    const siteFile = path.join(tenantDirectory, "site", "index.json");
    const homeFile = path.join(tenantDirectory, "pages", "home.json");
    if (!fs.existsSync(siteFile) || !fs.existsSync(homeFile)) continue;

    const site = unwrapSiteSettings(JSON.parse(fs.readFileSync(siteFile, "utf8")));
    const home = JSON.parse(fs.readFileSync(homeFile, "utf8"));

    for (const fieldName of siteFieldNames) {
      if (site[fieldName] !== undefined && home[fieldName] === undefined) {
        home[fieldName] = site[fieldName];
      }
    }

    home.slug = home.slug ?? "home";
    home.title = home.title ?? "Home";
    home.path = home.path ?? "/";
    home.isHome = true;

    fs.writeFileSync(homeFile, JSON.stringify(home, null, 2));
    console.log(`${tenantTypeDirectory}/${tenantSlug}: copied site fields to pages/home.json`);
  }
}
