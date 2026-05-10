import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.join(__dirname, "..", "content");

function revertTenantFolders(tenantType) {
  const directory = path.join(contentRoot, tenantType);
  if (!fs.existsSync(directory)) {
    console.log(`No ${tenantType} directory found, skipping.`);
    return;
  }

  const tenantSlugs = fs
    .readdirSync(directory)
    .filter((entry) => fs.statSync(path.join(directory, entry)).isDirectory());

  console.log(`Reverting ${tenantSlugs.length} ${tenantType} tenants...`);

  for (const tenantSlug of tenantSlugs) {
    revertTenant(directory, tenantSlug);
  }
}

function revertTenant(directory, tenantSlug) {
  const tenantDirectory = path.join(directory, tenantSlug);
  const siteFile = path.join(tenantDirectory, "site.json");
  const siteDirectory = path.join(tenantDirectory, "site");

  // Check if already in directory structure
  if (fs.existsSync(siteDirectory) && !fs.existsSync(siteFile)) {
    console.log(`  ${tenantSlug}: Already in directory structure, skipping.`);
    return;
  }

  // Check if site.json exists
  if (!fs.existsSync(siteFile)) {
    console.log(`  ${tenantSlug}: No site.json found, skipping.`);
    return;
  }

  // Create site directory
  if (fs.existsSync(siteDirectory)) {
    fs.rmSync(siteDirectory, { recursive: true, force: true });
  }
  fs.mkdirSync(siteDirectory, { recursive: true });

  // Move site.json to site/index.json
  const indexFile = path.join(siteDirectory, "index.json");
  fs.renameSync(siteFile, indexFile);

  console.log(`  ${tenantSlug}: Reverted to directory structure`);
}

// Run reversion
console.log("Starting reversion to directory structure...\n");

revertTenantFolders("doctors");
revertTenantFolders("hospitals");

console.log("\nReversion complete!");
console.log("Files have been moved from site.json to site/index.json directories.");
