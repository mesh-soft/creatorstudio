import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.join(__dirname, "..", "content");

function migrateTenantFolders(tenantType) {
  const directory = path.join(contentRoot, tenantType);
  if (!fs.existsSync(directory)) {
    console.log(`No ${tenantType} directory found, skipping.`);
    return;
  }

  const tenantSlugs = fs
    .readdirSync(directory)
    .filter((entry) => fs.statSync(path.join(directory, entry)).isDirectory());

  console.log(`Migrating ${tenantSlugs.length} ${tenantType} tenants...`);

  for (const tenantSlug of tenantSlugs) {
    migrateTenant(directory, tenantSlug);
  }
}

function migrateTenant(directory, tenantSlug) {
  const tenantDirectory = path.join(directory, tenantSlug);
  const siteDirectory = path.join(tenantDirectory, "site");
  const siteIndexFile = path.join(siteDirectory, "index.json");
  const siteFile = path.join(tenantDirectory, "site.json");

  // Check if already in flat structure
  if (fs.existsSync(siteFile) && !fs.existsSync(siteDirectory)) {
    console.log(`  ${tenantSlug}: Already in flat structure, skipping.`);
    return;
  }

  // Check if site/index.json exists
  if (!fs.existsSync(siteIndexFile)) {
    console.log(`  ${tenantSlug}: No site/index.json found, skipping.`);
    return;
  }

  // Move site/index.json to site.json
  fs.copyFileSync(siteIndexFile, siteFile);

  // Remove site directory
  fs.rmSync(siteDirectory, { recursive: true, force: true });

  console.log(`  ${tenantSlug}: Migrated to flat structure`);
}

// Run migration
console.log("Starting migration to flat structure...\n");

migrateTenantFolders("doctors");
migrateTenantFolders("hospitals");

console.log("\nMigration complete!");
console.log("Files have been moved from site/index.json to site.json.");
